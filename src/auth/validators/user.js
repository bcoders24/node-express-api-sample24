const Joi = require("joi");
const {
  password,
  phone,
  objectId,
  pageSchema,
} = require("../../../validators/common.validation");

const createUser = {
  body: Joi.object().keys({
    authMethod: Joi.string().required().valid("email", "phone"),
    firstName: Joi.string(),
    lastName: Joi.string(),
    fullName: Joi.string(),
    organization: Joi.string(),
    ISOCode: Joi.string(),
    imgUrl: Joi.string().allow(null, "").default(null),
    phone: Joi.string().required().custom(phone),
    email: Joi.string().required().email(),
    password: Joi.string().optional(null),
    referralCode: Joi.string(),
    createdByAdmin: Joi.boolean(),
  }),
};

const updateUser = {
  body: Joi.object().keys({
    firstName: Joi.string().lowercase(),
    lastName: Joi.string().lowercase(),
    fullName: Joi.string().lowercase(),
    organization: Joi.string(),
    ISOCode: Joi.string(),
    imgUrl: Joi.string().allow(null, "").default(null),
    phone: Joi.string().custom(phone),
    email: Joi.string().email(),
    isProfileCompleted: Joi.boolean(),
    status: Joi.string().valid("pending", "active", "deleted", "blocked"),
  }),
};

const search = {
    query: Joi.object().keys({
        status: Joi.string().valid('pending', 'active', 'deleted', 'blocked'),
        search: Joi.string(),
        sortOrder: Joi.string(),
        organization:Joi.string(),
        ...pageSchema
    })
};

const get = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const remove = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const connectWithProfile = {
  body: Joi.object().keys({
    referralCode: Joi.string().required(),
  }),
};
const connectedProfileRemove = {
  body: Joi.object().keys({
    connectUserId: Joi.string().required(),
    userId: Joi.string().required(),
    userType: Joi.string().valid("parentUser", "connectedUser"),
  }),
};

module.exports = {
  createUser,
  updateUser,
  search,
  get,
  remove,
  connectWithProfile,
  connectedProfileRemove,
};
