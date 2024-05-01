const Joi = require("joi");
const {objectId,pageSchema,password,} = require("../../../validators/common.validation");
const organization = require("../routes/organization");

const createUser = {
    body: Joi.object().keys({
        name: Joi.string(),
        address: Joi.string(),
        country: Joi.string(),
        city: Joi.string(),
        user: Joi.string(),
        planId: Joi.string(),
        state: Joi.string(),
        contactNumber: Joi.number(),
        pointOfContact:Joi.string(),
        designation: Joi.string(),
        email: Joi.string().required().email(),
        password: Joi.string().optional(null),
        businessImg: Joi.string().allow(null, "").default(null),
        profileImg: Joi.string().allow(null, "").default(null),
        countOfMember: Joi.number(),
        limitOfMembers: Joi.number(),
        endDate:Joi.date(),
        startDate: Joi.date(),
        duration: Joi.string(),
        whiteLabeling: Joi.boolean(),
        userLimit: Joi.number(),
        price: Joi.number(),
    }),
};

const updateUser = {
    body: Joi.object().keys({
        name: Joi.string(),
        address: Joi.string(),
        country: Joi.string(),
        city: Joi.string(),
        user: Joi.string(),
        planId: Joi.string(),
        state: Joi.string(),
        contactNumber: Joi.number(),
        pointOfContact:Joi.string(),
        designation: Joi.string(),
        password: Joi.string().optional(null),
        businessImg: Joi.string().allow(null, "").default(null),
        profileImg: Joi.string().allow(null, "").default(null),
        countOfMember: Joi.number(),
        limitOfMembers: Joi.number(),
        endDate:Joi.date(),
        startDate: Joi.date(),
        duration: Joi.string(),
        status:Joi.string(),
        whiteLabeling: Joi.boolean(),
        userLimit: Joi.number(),
        price: Joi.number(), 

    }),
};

const search = {
    query:Joi.object().keys({
        status: Joi.string().valid('pending', 'active', 'deleted', 'blocked'),
        paymentStatus: Joi.string().valid("paid","due"),
        search: Joi.string().allow(null,"").default(null,undefined,""),
        sortOrder: Joi.string(),
        organization:Joi.string(),
        ...pageSchema
    }),
};

const get = {
    params:Joi.object().keys({
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