import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf, errors } = format;

// Custom format for logs
const logFormat = printf(({ level, message, label, timestamp, stack, meta }) => {
    return `${timestamp} [${label}] ${level}: ${stack || message}, ${meta.message}`;
});

// Create logger
const logger = createLogger({
    level: 'info',
    format: combine(
        label({ label: 'API' }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }), // Log stack trace for errors
        format.json(),
        format.prettyPrint(),
        logFormat
    ),
    transports: [
        // new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'warn.log', level: 'warn' }),
        new transports.File({ filename: 'combined.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'rejections.log' })
    ]
});

export default logger;