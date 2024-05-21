// This file contains the schema of the user account database

const Joi = require("joi");

const schema = Joi.object({
  firstName: Joi.string().min(1).max(30).required(),

  lastName: Joi.string().min(1).max(30).required(),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: false },
    })
    .required(),

  mcGillId: Joi.string().alphanum().min(9).max(9).required(),

  userTypes: Joi.array()
    .items(Joi.string().valid("student", "ta", "prof", "sysop", "admin"))
    .required(),

  username: Joi.string().alphanum().min(2).max(30).required(),

  password: Joi.string().min(3).required(),

  registeredCourses: Joi.array().items(Joi.string()),
}).required();

module.exports = schema;
