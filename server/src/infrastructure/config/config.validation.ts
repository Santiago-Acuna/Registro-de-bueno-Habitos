// src/config.validation.ts
import * as Joi from 'joi';

export const configValidation = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

  PORT: Joi.number().default(3000),

  API_VERSION: Joi.string().default('v1'),

  DATABASE_URL: Joi.string().required(),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  RATE_LIMIT_MAX: Joi.number().default(100),

  RATE_LIMIT_WINDOW: Joi.number().default(60000),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
});
