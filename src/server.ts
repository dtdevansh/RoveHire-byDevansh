import pino from 'pino';
import app from './app.js';
import { env } from './config/env.js';

const logger = pino({ name: 'rove-hire-server' });

const server = app.listen(env.PORT, () => {
  logger.info(`Rove Hire backend running on port ${env.PORT} [${env.NODE_ENV}]`);
});

const gracefulShutdown = (signal: string): void => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
