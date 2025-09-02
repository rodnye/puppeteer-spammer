import pino from 'pino';

export const logger = pino({
  level: 'trace',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  customLevels: {
    browser: 25,
  },
});
