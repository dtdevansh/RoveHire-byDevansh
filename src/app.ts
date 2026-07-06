import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import pinoHttpModule from 'pino-http';

// pino-http types don't perfectly align with ESM default export at the type level
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pinoHttp = pinoHttpModule as any;
import pino from 'pino';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const logger = pino({ name: 'rove-hire' });

const app = express();

// ─────────────────────────────────────────────────────────────
// Global middleware chain
// Order matters: security → parsing → logging → rate-limit → routes → errors
// ─────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — locked to frontend origin, never *
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// HTTP parameter pollution guard
app.use(hpp());

// Structured request logging
app.use(pinoHttp({ logger }));

// Global rate limiter (OWASP API4)
app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────
// Routes — everything under /api/v1
// ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
