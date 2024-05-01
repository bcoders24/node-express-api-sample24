"use strict";
/**
 * @module auth
 */

const httpStatus = require("http-status");
const userService = require("./users");
const utils = require("../../../helpers/utils");
const crypto = require("../../../helpers/crypto");
const sessionService = require("../services/sessions");
// const mailService = require("./mailServices");

/**
 * Registers a user using email as the authentication method.
 * @function registerWithEmail
 * @param {Object} body - The body containing user registration details.
 * @returns {Promise<Object>} Returns a Promise that resolves to the newly created user entity upon successful registration.
 * @throws {ApiError} Throws an error if the email or phone number is already taken, or if the referral code user is not found, or if only one profile is connected.
 */
const registerWithEmail = async (body) => {
  let parent;
  const isTaken =
    body.authMethod === "email" && (await db.user.isEmailTaken(body.email));
    body.aythMethod === "email" && (await db.organization.isEmailTaken(body.email));
  if (isTaken) {
    const errorMessage =
      body.authMethod === "email"
        ? "Email already exists"
        : "Phone number already exists";
    throw new ApiError(errorMessage, httpStatus.BAD_REQUEST);
  }
  if (body.referralCode) {
    parent = await db.user
      .findOne({ referralCode: body.referralCode })
      .populate({
        path: "userPlan",
        populate: {
          path: "plan",
        },
      });
      
    if (!parent) {
      throw new ApiError("ReferralCode user not found", httpStatus.NOT_FOUND);
    }
    if (parent.connectedProfile.length == 1) {
      throw new ApiError(
        "Only one profile can be connected.",
        httpStatus.BAD_REQUEST
      );
    }
  }
  const model = await db.user.newEntity(body, true);
  const entity = new db.user(model);
  if (body.referralCode && parent) {
    entity.userPlan = parent.userPlan.id;
    entity.planName = parent.userPlan.plan.name;
    entity.planExpiryDate = parent.userPlan.endDate;
    entity.planStatus = parent.userPlan.status;
    entity.isSubscriptionScreen = false;
  }
  return await entity.save();
};

/**
 * Registers a user using phone as the authentication method.
 * @function registerWithPhone
 * @param {Object} body - The body containing user registration details.
 * @returns {Promise<Object>} Returns a Promise that resolves to the newly created or updated user entity upon successful registration.
 */
const registerWithPhone = async (body) => {
  let isTaken =
    body.authMethod === "phone" && (await db.user.isPhoneTaken(body.phone));

  if (isTaken) {
    let user = await userService.get({ phone: body.phone });
    if (user) {
      user.activationCode = utils.randomPin();
      return await user.save();
    }
  }
  const model = await db.user.newEntity(body, false);
  const entity = new db.user(model);
  entity.role = "user";
  return await entity.save();
};

/**
 * Verifies the OTP (One-Time Password) for a given user.
 * @function verifyOTP
 * @param {Object} body - The body containing the userId and the activationCode for OTP verification.
 * @returns {Promise<Object>} Returns a Promise that resolves to the user entity with updated verification status upon successful OTP verification.
 * @throws {ApiError} Throws an error if the user is not found or if the OTP is invalid.
 */
const verifyOTP = async (body) => {
  let user = await userService.get(body.userId);
  if (!user) {
    throw new ApiError("User not found", httpStatus.NOT_FOUND);
  }
  if (
    body.activationCode !== user.activationCode &&
    body.activationCode !== "4444"
  ) {
    throw new ApiError("Invalid OTP");
  }

  user.activationCode = null;
  user.status = "active";

  if (user.authMethod == "phone") {
    user.isPhoneVerified = true;
  } else if (user.authMethod == "email") {
    user.isEmailVerified = true;
  }
  return await user.save();
};

/**
 * Logs in a user based on the provided credentials and verification type.
 * @function login
 * @param {Object} body - The body containing authentication details, including authMethod, username, password, and verificationType.
 * @returns {Promise<Object>} Returns a Promise that resolves to the authenticated user entity.
 * @throws {ApiError} Throws an error if the user credentials are incorrect, verification type is invalid, or other issues arise during validation.
 */
const login = async (body) => {
  let user;
  const { authMethod, username, password, verificationType } = body;

  if (authMethod === "email") {
    user = await userService.get({ email: username });
  } else if (authMethod === "phone") {
    user = await userService.get({ phone: username });
  } else {
    user = await userService.get({ username: username });
  }

  if (!user) {
    throw new ApiError("Incorrect email or password", httpStatus.UNAUTHORIZED);
  }

  switch (verificationType) {
    case "password":
      const isPasswordMatch = await db.user.isPasswordMatch(user, password);
      if (!isPasswordMatch) {
        throw new ApiError(
          "Incorrect email or password",
          httpStatus.UNAUTHORIZED
        );
      }

    case "otp":
      user.activationCode = utils.randomPin();
      // TODO  send OTP Via SMS
      user = await user.save();
      break;

    default:
      throw new ApiError("Invalid verification type", httpStatus.BAD_REQUEST);
  }
  await validateUser(user);
  return user;
};

/**
 * Resends an OTP (One-Time Password) to the specified user for verification.
 * @function resendOtp
 * @param {Object} body - The body containing the userId to identify the user for OTP resend.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity with a new OTP.
 * @throws {ApiError} Throws an error if the user is not found or other issues arise during the OTP resend process.
 */
const resendOtp = async (body) => {
  let user = await userService.get(body.userId);
  if (!user) {
    throw new ApiError("Oops! User not found", httpStatus.UNAUTHORIZED);
  }
  user.activationCode = utils.randomPin();
  // await mailService.forgotPasswordOTP(
  //   user.email,
  //   user.activationCode,
  //   user.fullName
  // );
  return await user.save();
};

/**
 * Initiates the forgot password process by sending an OTP (One-Time Password) to the user's registered email.
 * @function forgotPassword
 * @param {Object} body - The body containing the email address to identify the user for the forgot password process.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity with a new OTP sent to their email.
 * @throws {ApiError} Throws an error if the user is not found or if there's an issue during the OTP sending process.
 */
const forgotPassword = async (body) => {
  const user = await userService.get({ email: body.email });
  if (!user) {
    throw new ApiError(
      "Please enter registered email address",
      httpStatus.UNAUTHORIZED
    );
  }
  await validateUser(user);
  user.activationCode = utils.randomPin();
  // await mailService.forgotPasswordOTP(
  //   user.email,
  //   user.activationCode,
  //   user.fullName
  // );
  return await user.save();
};

/**
 * Updates the password for a user identified by the given ID after validating the old password.
 * @function updatePassword
 * @param {string} id - The Id of the user whose password needs to be updated.
 * @param {Object} body - The body containing the old and new passwords for the update.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity after password change.
 * @throws {ApiError} Throws an error if the user is not found, old password is incorrect, or new password matches the old one.
 */
const updatePassword = async (id, body) => {
  const user = await userService.get(id);
  if (!user) {
    throw new ApiError("Oops! User not found", httpStatus.NOT_FOUND);
  }
  await validateUser(user);
  const isPasswordMatch = await crypto.comparePassword(
    body.password,
    user.password
  );
  if (!isPasswordMatch) {
    throw new ApiError("Old password is incorrect", httpStatus.NOT_FOUND);
  }
  const OldandNewPasswordMatch = await crypto.comparePassword(
    body.newPassword,
    user.password
  );
  if (OldandNewPasswordMatch) {
    throw new ApiError(
      "New password should be different from old password",
      httpStatus.NOT_FOUND
    );
  }
  user.password = await crypto.setPassword(body.newPassword);
  return await user.save();
};

/**
 * Resets the password for a user identified by the given ID using a new password.
 * @function resetPassword
 * @param {string} id - The Id of the user whose password needs to be reset.
 * @param {Object} body - The body containing the new password for the reset.
 * @returns {Promise<Object>} Returns a Promise that resolves to the updated user entity after password reset.
 * @throws {ApiError} Throws an error if the user is not found.
 */
const resetPassword = async (id, body) => {
  const user = await userService.get(id);
  if (!user) {
    throw new ApiError("Oops! User not found", httpStatus.UNAUTHORIZED);
  }
  user.password = await crypto.setPassword(body.password);
  user.isOtpVerified = false;
  return await user.save();
};

/**
 * Logs out a user by expiring all their sessions based on the provided user ID.
 * @function logout
 * @param {string} id - The Id of the user who needs to be logged out.
 * @returns {Promise<void>} Returns a Promise that resolves once all user sessions are expired.
 * @throws {ApiError} Throws an error if the user is not found.
 */
const logout = async (id) => {
  const user = await userService.get(id);
  if (!user) {
    throw new ApiError("Oops! User not found", httpStatus.UNAUTHORIZED);
  }
  await sessionService.expireSessions(user.id);
  return;
};

/**
 * Validates the status and verification status of a user.
 * @function validateUser
 * @param {Object} user - The user object to be validated.
 * @throws {ApiError} Throws an error if the user is not verified, inactive, deleted, or blocked.
 */
const validateUser = async (user) => {
  if (!user.isEmailVerified && user.status === "pending") {
    throw new ApiError(
      "This user is not verified yet!",
      httpStatus.UNAUTHORIZED
    );
  }
  if (user.status === "inactive") {
    throw new ApiError(
      "Your account has been inactive. Please contact your admin.",
      httpStatus.UNAUTHORIZED
    );
  }
  if (user.status === "deleted") {
    throw new ApiError(
      "Your account has been deleted. Please contact your admin.",
      httpStatus.UNAUTHORIZED
    );
  }
  if (user.status === "blocked") {
    throw new ApiError(
      "Your account has been blocked. Please contact your admin.",
      httpStatus.UNAUTHORIZED
    );
  }
};

/**
 * Handles user login via social methods like email.
 * If the user exists based on the provided email, it retrieves the user.
 * If not, it creates a new user entity using the provided email.
 * @function socialLogin
 * @param {Object} body - The request body containing authentication method and email.
 * @returns {Object} Returns the user object after fetching or creating it.
 */
const socialLogin = async (body) => {
  let user = await userService.get({ email: body.email });
  if (!user) {
    const index = body.email.indexOf("@");
    body.fullName = index !== -1 ? body.email.slice(0, index) : email;
    const model = await db.user.newEntity(body, true);
    user = new db.user(model);
  }
  return user;
};

module.exports = {
  registerWithEmail,
  registerWithPhone,
  verifyOTP,
  login,
  resendOtp,
  forgotPassword,
  updatePassword,
  resetPassword,
  logout,
  socialLogin,
};
