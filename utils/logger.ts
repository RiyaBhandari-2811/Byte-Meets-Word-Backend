import winston from 'winston';

const logLevel: string = process.env.LOG_LEVEL || 'debug';

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => {
        const now = new Date();
        // Convert UTC time to IST (UTC +5:30)
        const offset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 in milliseconds
        const istTime = new Date(now.getTime() + offset);
        
        // Format as YYYY-MM-DD HH:mm:ss.SSS
        return istTime.toISOString().replace('T', ' ').replace('Z', '').trim();
      },
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp} IST] [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'production' && logLevel === 'silent',
    }),
  ],
});

export default logger;
