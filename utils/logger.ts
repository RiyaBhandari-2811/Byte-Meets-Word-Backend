import winston from 'winston';

const logLevel : string = process.env.LOG_LEVEL || 'info'; 

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'production' && logLevel === 'silent',
    }),
  ],
});

export default logger;
