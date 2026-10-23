import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './logger.js';
import { ContactFormSchema } from '@meditrack/shared';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MediTrack Core API',
    version: '1.0.0-phase1'
  });
});

// Readiness check endpoint
app.get('/api/v1/readiness', (req: Request, res: Response) => {
  // Checks database configuration & environment
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  if (dbConfigured) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Contact form processing endpoint
app.post('/api/v1/contact', (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = ContactFormSchema.parse(req.body);
    logger.info({ email: validatedData.email, subject: validatedData.subject }, 'Contact inquiry received');

    res.status(200).json({
      success: true,
      message: 'Thank you for reaching out to MediTrack. Your request has been logged and queued for response.',
      data: {
        referenceNumber: `MDT-${Date.now()}`,
        receivedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Centralized error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err.message, stack: err.stack, path: req.path }, 'API Error Encountered');

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        details: err.errors
      }
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    }
  });
});
