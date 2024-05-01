const Joi = require('joi');

const media = Joi.object({
  files: Joi.array().required(),
});

module.exports = {
  media
};