const Joi = require('joi');

const { password, phone } = require('../../../validators/common.validation');

const registerViaEmail = {
  body: Joi.object().keys({
    authMethod: Joi.string().required().valid('email'),
    firstName: Joi.string().lowercase(),
    lastName: Joi.string().lowercase(),
    fullName: Joi.string().lowercase(),
    name: Joi.string(),
    email: Joi.string().required().email().lowercase(),
    password: Joi.string().required().custom(password),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios'),
    role: Joi.string(),
    referralCode: Joi.string()
  })
};

const registerViaPhone = {
  body: Joi.object().keys({
    authMethod: Joi.string().required().valid('phone'),
    countryCode: Joi.string().required(),
    ISOCode: Joi.string(),
    phone: Joi.string().required().custom(phone),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios')
  })
};

const verifyOTP = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    activationCode: Joi.string().required(),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios')
  })
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().lowercase(),
    email: Joi.string().email().lowercase(),
    password: Joi.string().custom(password),
    authMethod: Joi.string().required().valid('phone', 'email'),
    verificationType: Joi.string().optional().valid('password', 'otp'),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios')
  }).xor('username', 'email').required()
};

const resendOtp = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    authMethod: Joi.string().required().valid('phone'),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios')
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    authMethod: Joi.string().required().valid('phone', 'email'),
    email: Joi.string().required().email().lowercase(),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios')
  })
};

const updatePassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    newPassword: Joi.string().required().custom(password)
  })
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  })
};

const socialLogin = {
  body: Joi.object().keys({
    username: Joi.string().lowercase(),
    email: Joi.string().email().lowercase(),
    password: Joi.string().custom(password),
    authMethod: Joi.string().required().valid('google', 'facebook', 'apple', 'github'),
    verificationType: Joi.string().optional().valid('password', 'otp'),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid('web', 'android', 'ios'),
    googleId: Joi.string(),
    appleId: Joi.string(),
    facebookId: Joi.string(),
  }).xor('username', 'email').required()
};

module.exports = {
  registerViaEmail,
  registerViaPhone,
  verifyOTP,
  login,
  resendOtp,
  forgotPassword,
  updatePassword,
  resetPassword,
  socialLogin
};