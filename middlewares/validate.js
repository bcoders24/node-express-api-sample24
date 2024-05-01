const Joi = require('joi');
const httpStatus = require('http-status');
const utils = require('../helpers/utils');
const ApiError = require('../helpers/ApiError');

const validate = (schema) => (req, res, next) => {
    const validSchema = utils.pick(schema, ['params', 'query', 'body']);
    const object = utils.pick(req, Object.keys(validSchema));
    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return next(new ApiError(errorMessage, httpStatus.BAD_REQUEST));
    }
    Object.assign(req, value);
    return next();
};

module.exports = validate;
