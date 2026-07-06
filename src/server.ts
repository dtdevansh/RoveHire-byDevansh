import app from './app.js';
import { env } from './config/env.js';
import pino from 'pino';

const logger = pino({ name: 'rove-hire-server' });

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Rove Hire backend running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
