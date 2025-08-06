import * as Joi from 'joi';

export const configValidation = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  
  PORT: Joi.number()
    .default(3000),
  
  API_VERSION: Joi.string()
    .default('v1'),
  
  DATABASE_URL: Joi.string()
    .required()
    .description('PostgreSQL connection string'),
  
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:5173')
    .description('Comma-separated list of allowed origins'),
  
  RATE_LIMIT_MAX: Joi.number()
    .default(100)
    .description('Maximum requests per time window'),
  
  RATE_LIMIT_WINDOW: Joi.number()
    .default(60000)
    .description('Rate limiting time window in milliseconds'),
  
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
});