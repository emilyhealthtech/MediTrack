import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { AppointmentService } from '../services/appointment.service';
import { PatientService } from '../services/patient.service';
import {
  CreateAppointmentSchema,
  RescheduleAppointmentSchema,
  CancelAppointmentSchema,
  UpdateAppointmentStatusSchema,
  ProviderAvailabilitySchema,
} from '@meditrack/shared';
import { db } from '@meditrack/database';

export const appointmentRouter = Router();

// ==========================================
// 1. PATIENT SELF-SERVICE APPOINTMENTS
// ==========================================

// Get Patient's Personal Appointments
appointmentRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    const appointments = await AppointmentService.getAppointments({
      patientId: profile.id,
      status: req.query.status as string,
    });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    return next(error);
  }
});

// Patient Request / Book New Appointment
appointmentRouter.post('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateAppointmentSchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    // Get facility to find organization
    const facility = await db.facility.findUnique({ where: { id: validated.facilityId } });
    if (!facility) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Facility not found' },
      });
    }

    const appointment = await AppointmentService.createAppointment(
      facility.organizationId,
      { ...validated, patientId: profile.id },
      req.user!.id,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully.',
      data: appointment,
    });
  } catch (error: any) {
    if (error.code === 'PROVIDER_CONFLICT' || error.code === 'PATIENT_CONFLICT') {
      return res.status(409).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }
    return next(error);
  }
});

// Patient Reschedule Personal Appointment
appointmentRouter.put('/me/:id/reschedule', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = RescheduleAppointmentSchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const appointment = await db.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment || appointment.patientId !== profile.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found or access denied.' },
      });
    }

    const updated = await AppointmentService.rescheduleAppointment(
      req.params.id,
      validated,
      req.user!.id,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: updated,
    });
  } catch (error: any) {
    if (error.code === 'PROVIDER_CONFLICT' || error.code === 'PATIENT_CONFLICT') {
      return res.status(409).json({
        success: false,
        error: { code: error.code, message: error.message },
      });
    }
    return next(error);
  }
});

// Patient Cancel Personal Appointment
appointmentRouter.put('/me/:id/cancel', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CancelAppointmentSchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const appointment = await db.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment || appointment.patientId !== profile.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Appointment not found or access denied.' },
      });
    }

    const updated = await AppointmentService.cancelAppointment(
      req.params.id,
      validated.cancellationReason,
      req.user!.id,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// 2. STAFF & CLINICIAN APPOINTMENT MANAGEMENT
// ==========================================

const requireStaffOrgContext = async (req: Request, res: Response, next: NextFunction) => {
  const activeOrgId =
    req.session?.activeOrganizationId ||
    (req.headers['x-organization-id'] as string) ||
    (req.query.organizationId as string);

  if (req.user?.role === 'SYSTEM_ADMIN' && activeOrgId) {
    (req as any).activeOrgId = activeOrgId;
    return next();
  }

  if (!activeOrgId) {
    const userMembership = await db.membership.findFirst({
      where: { userId: req.user!.id },
    });
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_DENIED',
          message: 'You are not assigned to an active healthcare organization.',
        },
      });
    }
    (req as any).activeOrgId = userMembership.organizationId;
    return next();
  }

  const membership = await db.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: req.user!.id,
        organizationId: activeOrgId,
      },
    },
  });

  if (!membership && req.user?.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Access denied. You are not a member of the specified healthcare organization.',
      },
    });
  }

  (req as any).activeOrgId = activeOrgId;
  return next();
};

// List Organization Appointments (Staff)
appointmentRouter.get(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const appointments = await AppointmentService.getAppointments({
        organizationId: activeOrgId,
        facilityId: req.query.facilityId as string,
        patientId: req.query.patientId as string,
        providerId: req.query.providerId as string,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      return res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Generate iCalendar (.ics) export file for appointment integration
appointmentRouter.get(
  '/:id/ics',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          facility: true,
          patient: { include: { user: true } },
          provider: true,
        },
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found.' },
        });
      }

      const startDate = new Date(appointment.scheduledAt);
      const endDate = new Date(startDate.getTime() + appointment.durationMinutes * 60000);

      const formatDate = (date: Date) =>
        date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MediTrack//Healthcare Appointments//EN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:appointment-${appointment.id}@meditrack.ng`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:Healthcare Appointment — ${appointment.facility.name}`,
        `DESCRIPTION:Department: ${appointment.department}\\nConsultation Mode: ${appointment.mode}`,
        `LOCATION:${appointment.facility.name}, ${appointment.facility.address}, ${appointment.facility.city}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="appointment-${appointment.id}.ics"`);
      return res.status(200).send(icsContent);
    } catch (error) {
      return next(error);
    }
  }
);

// Staff Create Appointment
appointmentRouter.post(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const validated = CreateAppointmentSchema.parse(req.body);

      const appointment = await AppointmentService.createAppointment(
        activeOrgId,
        validated,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        data: appointment,
      });
    } catch (error: any) {
      if (error.code === 'PROVIDER_CONFLICT' || error.code === 'PATIENT_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      return next(error);
    }
  }
);

// Staff Update Appointment Status
appointmentRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = UpdateAppointmentStatusSchema.parse(req.body);
      const appointment = await db.appointment.findUnique({ where: { id: req.params.id } });

      if (!appointment || appointment.organizationId !== (req as any).activeOrgId) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment not found or access denied.' },
        });
      }

      const updated = await AppointmentService.updateAppointmentStatus(
        req.params.id,
        validated,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: `Appointment status updated to ${updated.status}.`,
        data: updated,
      });
    } catch (error: any) {
      if (error.code === 'INVALID_STATUS_TRANSITION') {
        return res.status(400).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      return next(error);
    }
  }
);

// Staff Set Provider Availability
appointmentRouter.post(
  '/availability',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const validated = ProviderAvailabilitySchema.parse(req.body);

      const availability = await AppointmentService.setProviderAvailability(
        activeOrgId,
        validated,
        req.user!.id
      );

      return res.status(200).json({
        success: true,
        message: 'Provider availability rule saved.',
        data: availability,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Get Provider Slots for a Specific Date
appointmentRouter.get(
  '/availability/slots',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const facilityId = req.query.facilityId as string;
      const providerId = req.query.providerId as string;
      const date = req.query.date as string;

      if (!facilityId || !providerId || !date) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_QUERY', message: 'facilityId, providerId, and date query parameters are required.' },
        });
      }

      const slots = await AppointmentService.getAvailableSlots(facilityId, providerId, date);

      return res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      return next(error);
    }
  }
);
