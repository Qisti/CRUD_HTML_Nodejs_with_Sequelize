const Joi = require("joi");
const app = require('express')()
const validator = require('express-joi-validation')({})

joi = {
	schema: {
		name: Joi.string().min(2).max(50).required(),
		gender: Joi.string().required().valid('f', 'm'),
		date_of_birth: Joi.date().required(),
		address: Joi.string().min(5).required(),
		email: Joi.string().email()
	},
	admin: {
		username: Joi.string().min(3).max(20).required(),
		password: Joi.string().min(2).max(20).required(),
		mail: Joi.string.email().required() 
	}
}

module.exports = joi;