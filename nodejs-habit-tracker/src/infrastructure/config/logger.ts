import pino from 'pino';

import { env } from './environment';

export const createLogger = () => {
  const logger = pino({
    level: env.LOG_LEVEL,
    ...(env.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    }),
    ...(env.NODE_ENV === 'production' && {
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    }),
  });

  return logger;
};

export const logger = createLogger();
export type Logger = typeof logger;