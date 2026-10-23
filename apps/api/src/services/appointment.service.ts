import { db } from '@meditrack/database';
import {
  CreateAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentStatusInput,
  ProviderAvailabilityInput,
} from '@meditrack/shared';

// Valid status transitions matrix
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['SCHEDULED', 'CONFIRMED', 'CANCELLED'],
  SCHEDULED: ['CONFIRMED', 'IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export class AppointmentService {
  /**
   * Helper to check for scheduling conflict (overlapping active appointments)
   */
  private static async checkConflict(
    facilityId: string,
    patientId: string,
    providerId?: string | null,
    startTime?: Date,
    durationMinutes: number = 30,
    excludeAppointmentId?: string
  ) {
    if (!startTime) return;
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const activeStatuses = ['REQUESTED', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'];

    // Check provider conflict if provider is assigned
    if (providerId) {
      const providerAppointments = await db.appointment.findMany({
        where: {
          id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
          providerId,
          status: { in: activeStatuses as any },
          scheduledAt: { lt: end },
        },
      });

      const hasProviderConflict = providerAppointments.some((app: any) => {
        const appStart = app.scheduledAt.getTime();
        const appEnd = appStart + app.durationMinutes * 60 * 1000;
        return appStart < end.getTime() && appEnd > start.getTime();
      });

      if (hasProviderConflict) {
        const error = new Error('Scheduling conflict detected: Provider is already booked during this time slot.');
        (error as any).code = 'PROVIDER_CONFLICT';
        throw error;
      }
    }

    // Check patient conflict
    const patientAppointments = await db.appointment.findMany({
      where: {
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        patientId,
        status: { in: activeStatuses as any },
        scheduledAt: { lt: end },
      },
    });

    const hasPatientConflict = patientAppointments.some((app: any) => {
      const appStart = app.scheduledAt.getTime();
      const appEnd = appStart + app.durationMinutes * 60 * 1000;
      return appStart < end.getTime() && appEnd > start.getTime();
    });

    if (hasPatientConflict) {
      const error = new Error('Scheduling conflict detected: Patient already has another active appointment at this time.');
      (error as any).code = 'PATIENT_CONFLICT';
      throw error;
    }
  }

  /**
   * Create Appointment
   */
  static async createAppointment(
    organizationId: string,
    input: CreateAppointmentInput,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const facility = await db.facility.findFirst({
      where: { id: input.facilityId, organizationId },
    });

    if (!facility) {
      throw new Error('Facility not found or does not belong to organization');
    }

    const patient = await db.patient.findUnique({
      where: { id: input.patientId! },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    if (input.providerId) {
      const providerMembership = await db.membership.findFirst({
        where: { userId: input.providerId, organizationId },
      });
      if (!providerMembership) {
        throw new Error('Specified provider is not a member of this organization');
      }
    }

    const scheduledAtDate = new Date(input.scheduledAt);

    // Conflict detection
    await this.checkConflict(
      input.facilityId,
      patient.id,
      input.providerId,
      scheduledAtDate,
      input.durationMinutes
    );

    const appointment = await db.appointment.create({
      data: {
        organizationId,
        facilityId: input.facilityId,
        patientId: patient.id,
        providerId: input.providerId || null,
        scheduledAt: scheduledAtDate,
        durationMinutes: input.durationMinutes || 30,
        department: input.department,
        reason: input.reason || null,
        mode: (input.mode as any) || 'IN_PERSON',
        timeZone: input.timeZone || 'Africa/Lagos',
        status: 'SCHEDULED',
        notes: input.notes || null,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        provider: true,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        organizationId,
        action: 'APPOINTMENT_CREATED',
        entity: 'Appointment',
        entityId: appointment.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ scheduledAt: appointment.scheduledAt, mode: appointment.mode }),
      },
    });

    return appointment;
  }

  /**
   * Reschedule Appointment
   */
  static async rescheduleAppointment(
    appointmentId: string,
    input: RescheduleAppointmentInput,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)) {
      const error = new Error(`Cannot reschedule an appointment with status ${appointment.status}`);
      (error as any).code = 'INVALID_STATUS';
      throw error;
    }

    const newScheduledAt = new Date(input.scheduledAt);
    const duration = input.durationMinutes || appointment.durationMinutes;

    await this.checkConflict(
      appointment.facilityId,
      appointment.patientId,
      appointment.providerId,
      newScheduledAt,
      duration,
      appointment.id
    );

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledAt: newScheduledAt,
        durationMinutes: duration,
        reason: input.reason ? `${appointment.reason || ''} (Rescheduled: ${input.reason})` : appointment.reason,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        provider: true,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        organizationId: updated.organizationId,
        action: 'APPOINTMENT_RESCHEDULED',
        entity: 'Appointment',
        entityId: updated.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({
          oldScheduledAt: appointment.scheduledAt,
          newScheduledAt: updated.scheduledAt,
          reason: input.reason,
        }),
      },
    });

    return updated;
  }

  /**
   * Cancel Appointment
   */
  static async cancelAppointment(
    appointmentId: string,
    cancellationReason: string,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      const error = new Error(`Appointment is already ${appointment.status.toLowerCase()}`);
      (error as any).code = 'INVALID_STATUS';
      throw error;
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        cancellationReason,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        provider: true,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        organizationId: updated.organizationId,
        action: 'APPOINTMENT_CANCELLED',
        entity: 'Appointment',
        entityId: updated.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ cancellationReason }),
      },
    });

    return updated;
  }

  /**
   * Update Appointment Status
   */
  static async updateAppointmentStatus(
    appointmentId: string,
    input: UpdateAppointmentStatusInput,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const currentStatus = appointment.status;
    const allowedNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(input.status)) {
      const error = new Error(`Invalid status transition from ${currentStatus} to ${input.status}`);
      (error as any).code = 'INVALID_STATUS_TRANSITION';
      throw error;
    }

    const updated = await db.appointment.update({
      where: { id: appointmentId },
      data: {
        status: input.status as any,
        cancellationReason: input.cancellationReason || appointment.cancellationReason,
        notes: input.notes ? `${appointment.notes || ''}\n${input.notes}`.trim() : appointment.notes,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        provider: true,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        organizationId: updated.organizationId,
        action: 'APPOINTMENT_STATUS_UPDATED',
        entity: 'Appointment',
        entityId: updated.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ previousStatus: currentStatus, newStatus: input.status }),
      },
    });

    return updated;
  }

  /**
   * Get Appointments with filtering
   */
  static async getAppointments(params: {
    organizationId?: string;
    facilityId?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (params.organizationId) where.organizationId = params.organizationId;
    if (params.facilityId) where.facilityId = params.facilityId;
    if (params.patientId) where.patientId = params.patientId;
    if (params.providerId) where.providerId = params.providerId;
    if (params.status && params.status !== 'ALL') where.status = params.status;

    if (params.startDate || params.endDate) {
      where.scheduledAt = {};
      if (params.startDate) where.scheduledAt.gte = new Date(params.startDate);
      if (params.endDate) where.scheduledAt.lte = new Date(params.endDate);
    }

    return db.appointment.findMany({
      where,
      include: {
        facility: true,
        patient: { include: { user: true } },
        provider: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /**
   * Provider Availability Management
   */
  static async setProviderAvailability(
    organizationId: string,
    input: ProviderAvailabilityInput,
    actorUserId: string
  ) {
    const availability = await db.providerAvailability.upsert({
      where: {
        facilityId_providerId_dayOfWeek: {
          facilityId: input.facilityId,
          providerId: input.providerId,
          dayOfWeek: input.dayOfWeek,
        },
      },
      create: {
        organizationId,
        facilityId: input.facilityId,
        providerId: input.providerId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        slotDurationMinutes: input.slotDurationMinutes || 30,
      },
      update: {
        startTime: input.startTime,
        endTime: input.endTime,
        slotDurationMinutes: input.slotDurationMinutes || 30,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        organizationId,
        action: 'PROVIDER_AVAILABILITY_SET',
        entity: 'ProviderAvailability',
        entityId: availability.id,
        detailsJson: JSON.stringify(input),
      },
    });

    return availability;
  }

  /**
   * Get Provider Available Slots for a Given Date (YYYY-MM-DD)
   */
  static async getAvailableSlots(facilityId: string, providerId: string, dateStr: string) {
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getUTCDay(); // 0 = Sun, 1 = Mon ...

    const rule = await db.providerAvailability.findUnique({
      where: {
        facilityId_providerId_dayOfWeek: {
          facilityId,
          providerId,
          dayOfWeek,
        },
      },
    });

    if (!rule) {
      return []; // Provider has no availability defined for this day
    }

    const [startH, startM] = rule.startTime.split(':').map(Number);
    const [endH, endM] = rule.endTime.split(':').map(Number);

    const slotDurationMs = rule.slotDurationMinutes * 60 * 1000;

    const dayStartMs = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), startH, startM)).getTime();
    const dayEndMs = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), endH, endM)).getTime();

    // Query existing appointments for provider on that date
    const startOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate(), 23, 59, 59));

    const existingAppointments = await db.appointment.findMany({
      where: {
        providerId,
        facilityId,
        status: { in: ['REQUESTED', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    const slots: { startTime: string; available: boolean }[] = [];

    for (let currentMs = dayStartMs; currentMs + slotDurationMs <= dayEndMs; currentMs += slotDurationMs) {
      const slotStart = new Date(currentMs);
      const slotEnd = new Date(currentMs + slotDurationMs);

      const isConflicting = existingAppointments.some((app: any) => {
        const appStart = app.scheduledAt.getTime();
        const appEnd = appStart + app.durationMinutes * 60 * 1000;
        return appStart < slotEnd.getTime() && appEnd > slotStart.getTime();
      });

      slots.push({
        startTime: slotStart.toISOString(),
        available: !isConflicting,
      });
    }

    return slots;
  }
}
