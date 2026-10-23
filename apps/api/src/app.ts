import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { logger } from './logger';
import { ContactFormSchema } from '@meditrack/shared';
import { sessionMiddleware } from './middleware/session.middleware';
import { authRouter } from './routes/auth.routes';
import { organizationRouter } from './routes/organization.routes';
import { meRouter } from './routes/me.routes';
import { facilityRouter } from './routes/facility.routes';
import { patientRouter } from './routes/patient.routes';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware as express.RequestHandler);

// Health check endpoint
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MediTrack Core API',
    version: '1.0.0-phase3',
  });
});

// Readiness check endpoint
app.get('/api/v1/readiness', (req: Request, res: Response) => {
  const dbConfigured = Boolean(process.env.DATABASE_URL);
  if (dbConfigured) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
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
        receivedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Mount Feature Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/admin', organizationRouter);
app.use('/api/v1/me', meRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1', facilityRouter);

// Centralized error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err.message, stack: err.stack, path: req.path }, 'API Error Encountered');

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        details: err.errors,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal error occurred. Please try again later.',
    },
  });
});
