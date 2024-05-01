const crypto = require("../../../helpers/crypto");
const utils = require("../../../helpers/utils");
const authMethods = ["email", "google", "facebook", "apple", "github", "phone"];

const entity = {
  firstName: String,
  lastName: String,
  fullName: String,
  userName: String,
  imgUrl: String,
  coverImgUrl: String,
  authMethod: {
    type: String,
    enum: authMethods,
    default: "email",
  },
  countryCode: String,
  ISOCode: String,
  phone: String,
  email: {
    type: String,
    lowercase: true,
  },
  activationCode: String,
  password: String,
  status: {
    type: String,
    enum: ["pending", "active", "deleted", "blocked"],
    default: "pending",
  },
  role: {
    type: String,
    enum: ["superAdmin", "user", "admin", "organizer"],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  googleId: String,
  facebookId: String,
  appleId: String,
  githubId: String,
  lastAccess: {
    type: Date,
    default: null,
  },


  
};

let statics = {};

statics.newEntity = async (body, createdByAdmin= true) => {
  const model = {
    firstName: body.firstName,
    lastName: body.lastName,
    fullName: !body.fullName
      ? body.firstName
        ? body.lastName
          ? `${body.firstName} ${body.lastName}`
          : body.firstName
        : ""
      : body.fullName,
    authMethod: body.authMethod||"email",
    userName: body.userName,
    email: body.email,
    phone: body.phone,
    status: body.status,
    ISOCode: body.ISOCode,
    countryCode: body.countryCode,
    role: body.deviceType == "web" ? "admin" : "user",
    googleId: body.googleId,
    appleId: body.appleId,
    facebookId: body.facebookId,
  };
  if (body.password) {
    model.password = await crypto.setPassword(body.password);
  }
  if (createdByAdmin) {
    model.isEmailVerified = body.authMethod === "email";
    model.isPhoneVerified = body.authMethod === "phone";
    model.status = "active";
  }
   else {
    model.activationCode = utils.randomPin();
  }
  
  return model;
};

statics.isEmailTaken = async function (email) {
  return !!(await this.findOne({ email }));
};

statics.isPhoneTaken = async function (phone) {
  return !!(await this.findOne({ phone }));
};

statics.isPasswordMatch = async (user, password) => {
  return await crypto.comparePassword(password, user.password);
};

module.exports = {
  entity,
  statics,
};
