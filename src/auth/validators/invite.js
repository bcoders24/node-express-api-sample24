const Joi = require("joi");
const {pageSchema, password} = require("../../../validators/common.validation");

const createUser = {
    body: Joi.object().keys({
        name: Joi.string(),
        email: Joi.string(),
        password: Joi.string(),
    }),
};

const updateUser = {
    body: Joi.object().keys({
        name: Joi.string(),
    })
};

const search = {
    query: Joi.object().keys({
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

module.exports = {
  createUser,
  updateUser,
  search,
  get,
  remove,
};
