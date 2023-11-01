import * as Joi from 'joi';

export const validationSchema = Joi.object({
	APP_ID: Joi.string().required(),
	PORT: Joi.number().required(),
	DATABASE_URL: Joi.string().required(),
	MESSAGE_PUBLIC_KEY: Joi.string().required(),
	MESSAGE_PRIVATE_KEY: Joi.string().required(),
	ERROR_DEFAULT_TIME_FORMAT: Joi.string().required(),
	ERROR_DEFAULT_TIME_TZ: Joi.string().required(),
	ERROR_DEFAULT_MESSAGE: Joi.string().required(),
	ERROR_DEFAULT_STATUS: Joi.number().required()
});
