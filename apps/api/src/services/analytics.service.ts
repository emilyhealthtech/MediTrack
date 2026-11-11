import { db } from '@meditrack/database';
import {
  AnalyticsDashboardDTO,
  AnalyticsQueryInput,
  AnalyticsSummaryStats,
  DemographicsDistribution,
  DepartmentPerformance,
  ProviderActivityStat,
  RequestedServiceStat,
  TimeSeriesPoint,
  AppointmentVisitStatistics,
} from '@meditrack/shared';

export class AnalyticsService {
  /**
   * Retrieves full analytics dashboard metrics for an organization with date and filter options.
   */
  public static async getDashboardAnalytics(
    organizationId: string,
    filters: AnalyticsQueryInput
  ): Promise<AnalyticsDashboardDTO> {
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    const orgName = org?.name || 'Healthcare Organization';

    // Parse date window
    const now = new Date();
    // Default to last 30 days if not specified
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = filters.startDate ? new Date(filters.startDate) : defaultStart;
    const endDate = filters.endDate ? new Date(filters.endDate) : now;
    const granularity = filters.granularity || 'daily';

    // Base appointment where clause (scoped strictly by organizationId, plus optional facility/department/provider)
    const baseAppointmentWhere: any = {
      organizationId,
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters.facilityId) {
      baseAppointmentWhere.facilityId = filters.facilityId;
    }
    if (filters.department) {
      baseAppointmentWhere.department = filters.department;
    }
    if (filters.providerId) {
      baseAppointmentWhere.providerId = filters.providerId;
    }

    // 1. Fetch appointments within time window and all-time patient & provider counts
    const [
      appointmentsInRange,
      allAppointmentsCount,
      allCompletedCount,
      allPendingCount,
      allCancelledCount,
      allNoShowCount,
      totalRegisteredPatients,
      newPatientsCount,
      allPatients,
      activeProvidersCount,
      providersWithAppointments,
    ] = await Promise.all([
      db.appointment.findMany({
        where: baseAppointmentWhere,
        include: {
          facility: { select: { id: true, name: true } },
          provider: { select: { id: true, fullName: true, email: true } },
          patient: {
            select: {
              id: true,
              gender: true,
              dateOfBirth: true,
              createdAt: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      // Total appointments in range
      db.appointment.count({ where: baseAppointmentWhere }),
      db.appointment.count({ where: { ...baseAppointmentWhere, status: 'COMPLETED' } }),
      db.appointment.count({
        where: {
          ...baseAppointmentWhere,
          status: { in: ['REQUESTED', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        },
      }),
      db.appointment.count({ where: { ...baseAppointmentWhere, status: 'CANCELLED' } }),
      db.appointment.count({ where: { ...baseAppointmentWhere, status: 'NO_SHOW' } }),
      // Total registered patients for this organization (all-time)
      db.patient.count({
        where: { organizationId },
      }),
      // New patients registered within the date window
      db.patient.count({
        where: {
          organizationId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      // Patient demographics for patients belonging to this organization
      db.patient.findMany({
        where: { organizationId },
        select: {
          id: true,
          gender: true,
          dateOfBirth: true,
          createdAt: true,
        },
      }),
      // Active healthcare providers (active staff memberships in the organization)
      db.membership.count({
        where: {
          organizationId,
          isActive: true,
          role: { in: ['FACILITY_STAFF', 'FACILITY_ADMIN'] },
        },
      }),
      // Providers with appointments for provider activity statistics
      db.membership.findMany({
        where: {
          organizationId,
          role: { in: ['FACILITY_STAFF', 'FACILITY_ADMIN'] },
        },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    // Summary stats
    const summaryStats: AnalyticsSummaryStats = {
      totalRegisteredPatients,
      newPatients: newPatientsCount,
      totalAppointments: allAppointmentsCount,
      completedAppointments: allCompletedCount,
      pendingAppointments: allPendingCount,
      cancelledAppointments: allCancelledCount,
      missedAppointments: allNoShowCount,
      activeHealthcareProviders: activeProvidersCount,
    };

    // 2. Patient registration trends over time
    const patientRegistrationTrends = this.aggregateTimeSeries(
      allPatients
        .filter((p: any) => p.createdAt >= startDate && p.createdAt <= endDate)
        .map((p: any) => new Date(p.createdAt)),
      startDate,
      endDate,
      granularity
    );

    // 3. Appointment trends over time (total, completed, cancelled, missed)
    const appointmentTrends = {
      total: this.aggregateTimeSeries(
        appointmentsInRange.map((a: any) => new Date(a.scheduledAt)),
        startDate,
        endDate,
        granularity
      ),
      completed: this.aggregateTimeSeries(
        appointmentsInRange
          .filter((a: any) => a.status === 'COMPLETED')
          .map((a: any) => new Date(a.scheduledAt)),
        startDate,
        endDate,
        granularity
      ),
      cancelled: this.aggregateTimeSeries(
        appointmentsInRange
          .filter((a: any) => a.status === 'CANCELLED')
          .map((a: any) => new Date(a.scheduledAt)),
        startDate,
        endDate,
        granularity
      ),
      missed: this.aggregateTimeSeries(
        appointmentsInRange
          .filter((a: any) => a.status === 'NO_SHOW')
          .map((a: any) => new Date(a.scheduledAt)),
        startDate,
        endDate,
        granularity
      ),
    };

    // 4. Patient demographics: Gender and Age distribution
    const demographics = this.calculateDemographics(allPatients);

    // 5. Department performance
    const departmentPerformance = this.calculateDepartmentPerformance(appointmentsInRange);

    // 6. Most requested healthcare services (departments & consultation modes)
    const mostRequestedServices = this.calculateRequestedServices(appointmentsInRange);

    // 7. Visit statistics (rates and duration)
    const visitStatistics = this.calculateVisitStatistics(
      appointmentsInRange,
      allAppointmentsCount,
      allCompletedCount,
      allCancelledCount,
      allNoShowCount
    );

    // 8. Healthcare provider activity
    const providerActivity = this.calculateProviderActivity(
      providersWithAppointments,
      appointmentsInRange
    );

    return {
      organizationId,
      organizationName: orgName,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        granularity,
      },
      summaryStats,
      patientRegistrationTrends,
      appointmentTrends,
      patientDemographics: demographics,
      departmentPerformance,
      mostRequestedServices,
      visitStatistics,
      providerActivity,
    };
  }

  /**
   * Helper: Aggregates a list of Dates into continuous time series points based on granularity.
   */
  private static aggregateTimeSeries(
    dates: Date[],
    startDate: Date,
    endDate: Date,
    granularity: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): TimeSeriesPoint[] {
    const countsMap = new Map<string, number>();

    const getBucketKey = (d: Date): { key: string; label: string } => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      if (granularity === 'yearly') {
        const key = `${year}`;
        return { key, label: `${year}` };
      }

      if (granularity === 'monthly') {
        const key = `${year}-${month}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { key, label };
      }

      if (granularity === 'weekly') {
        // Simple week bucket
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const key = `${year}-W${String(weekNum).padStart(2, '0')}`;
        return { key, label: `Wk ${weekNum}, ${year}` };
      }

      // daily
      const key = `${year}-${month}-${day}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { key, label };
    };

    // Initialize continuous buckets between startDate and endDate
    const buckets: { key: string; label: string }[] = [];
    const seenKeys = new Set<string>();

    const current = new Date(startDate.getTime());
    // Normalize current time to beginning of day
    current.setHours(0, 0, 0, 0);
    const endBoundary = new Date(endDate.getTime());

    while (current <= endBoundary) {
      const { key, label } = getBucketKey(current);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        buckets.push({ key, label });
        countsMap.set(key, 0);
      }

      if (granularity === 'yearly') {
        current.setFullYear(current.getFullYear() + 1);
      } else if (granularity === 'monthly') {
        current.setMonth(current.getMonth() + 1);
      } else if (granularity === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    // Tally actual records into buckets
    for (const d of dates) {
      const { key } = getBucketKey(d);
      countsMap.set(key, (countsMap.get(key) || 0) + 1);
    }

    return buckets.map((b) => ({
      date: b.key,
      label: b.label,
      count: countsMap.get(b.key) || 0,
    }));
  }

  /**
   * Helper: Calculates gender and age group distributions.
   */
  private static calculateDemographics(patients: any[]): DemographicsDistribution {
    let male = 0;
    let female = 0;
    let other = 0;
    let unspecified = 0;

    const ageCounts: { [key: string]: number } = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '61+': 0,
      Unknown: 0,
    };

    const now = new Date();

    for (const p of patients) {
      // Gender
      const g = (p.gender || '').toUpperCase();
      if (g === 'MALE' || g === 'M') male++;
      else if (g === 'FEMALE' || g === 'F') female++;
      else if (g === 'OTHER') other++;
      else unspecified++;

      // Age calculation
      if (p.dateOfBirth) {
        const dob = new Date(p.dateOfBirth);
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
          age--;
        }

        if (age < 0 || isNaN(age)) {
          ageCounts['Unknown']++;
        } else if (age <= 17) {
          ageCounts['0-17']++;
        } else if (age <= 30) {
          ageCounts['18-30']++;
        } else if (age <= 45) {
          ageCounts['31-45']++;
        } else if (age <= 60) {
          ageCounts['46-60']++;
        } else {
          ageCounts['61+']++;
        }
      } else {
        ageCounts['Unknown']++;
      }
    }

    const totalPatients = patients.length || 1;
    const ageGroups = Object.entries(ageCounts).map(([group, count]) => ({
      group,
      count,
      percentage: Math.round((count / totalPatients) * 100),
    }));

    return {
      gender: { male, female, other, unspecified },
      ageGroups,
    };
  }

  /**
   * Helper: Computes completion and cancellation rates per department.
   */
  private static calculateDepartmentPerformance(appointments: any[]): DepartmentPerformance[] {
    const deptMap = new Map<
      string,
      { total: number; completed: number; cancelled: number }
    >();

    for (const a of appointments) {
      const dept = a.department || 'General Medicine';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total: 0, completed: 0, cancelled: 0 });
      }
      const data = deptMap.get(dept)!;
      data.total++;
      if (a.status === 'COMPLETED') data.completed++;
      if (a.status === 'CANCELLED') data.cancelled++;
    }

    return Array.from(deptMap.entries())
      .map(([department, stats]) => ({
        department,
        totalAppointments: stats.total,
        completedAppointments: stats.completed,
        cancelledAppointments: stats.cancelled,
        completionRate:
          stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.totalAppointments - a.totalAppointments);
  }

  /**
   * Helper: Most requested healthcare services by department and mode.
   */
  private static calculateRequestedServices(appointments: any[]): RequestedServiceStat[] {
    const total = appointments.length || 1;
    const serviceMap = new Map<string, { type: 'department' | 'consultationMode'; count: number }>();

    for (const a of appointments) {
      const dept = a.department || 'General Medicine';
      const mode = a.mode || 'IN_PERSON';

      const deptServiceKey = `Dept: ${dept}`;
      const modeServiceKey = `Consultation Mode: ${mode.replace('_', ' ')}`;

      if (!serviceMap.has(deptServiceKey)) {
        serviceMap.set(deptServiceKey, { type: 'department', count: 0 });
      }
      serviceMap.get(deptServiceKey)!.count++;

      if (!serviceMap.has(modeServiceKey)) {
        serviceMap.set(modeServiceKey, { type: 'consultationMode', count: 0 });
      }
      serviceMap.get(modeServiceKey)!.count++;
    }

    return Array.from(serviceMap.entries())
      .map(([service, val]) => ({
        service,
        type: val.type,
        count: val.count,
        percentage: Math.round((val.count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Helper: Calculates visit metrics including completion rates, modes, and duration.
   */
  private static calculateVisitStatistics(
    appointments: any[],
    totalAppointments: number,
    completedCount: number,
    cancelledCount: number,
    noShowCount: number
  ): AppointmentVisitStatistics {
    const divisor = totalAppointments > 0 ? totalAppointments : 1;
    const overallCompletionRate = Math.round((completedCount / divisor) * 100);
    const overallCancellationRate = Math.round((cancelledCount / divisor) * 100);
    const overallNoShowRate = Math.round((noShowCount / divisor) * 100);

    let totalDuration = 0;
    let durationCount = 0;
    let inPerson = 0;
    let virtual = 0;
    let telephone = 0;

    for (const a of appointments) {
      if (a.durationMinutes) {
        totalDuration += a.durationMinutes;
        durationCount++;
      }
      if (a.mode === 'IN_PERSON') inPerson++;
      else if (a.mode === 'VIRTUAL') virtual++;
      else if (a.mode === 'TELEPHONE') telephone++;
    }

    const averageDurationMinutes =
      durationCount > 0 ? Math.round(totalDuration / durationCount) : 30;

    return {
      overallCompletionRate,
      overallCancellationRate,
      overallNoShowRate,
      averageDurationMinutes,
      modeDistribution: {
        inPerson,
        virtual,
        telephone,
      },
    };
  }

  /**
   * Helper: Aggregates appointments handled by healthcare providers.
   */
  private static calculateProviderActivity(
    memberships: any[],
    appointments: any[]
  ): ProviderActivityStat[] {
    const providerMap = new Map<
      string,
      {
        providerName: string;
        email: string;
        total: number;
        completed: number;
        scheduled: number;
      }
    >();

    for (const m of memberships) {
      if (m.user) {
        providerMap.set(m.userId, {
          providerName: m.user.fullName,
          email: m.user.email,
          total: 0,
          completed: 0,
          scheduled: 0,
        });
      }
    }

    for (const a of appointments) {
      if (a.providerId && providerMap.has(a.providerId)) {
        const stats = providerMap.get(a.providerId)!;
        stats.total++;
        if (a.status === 'COMPLETED') stats.completed++;
        if (a.status === 'SCHEDULED' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS') {
          stats.scheduled++;
        }
      }
    }

    return Array.from(providerMap.entries())
      .map(([providerId, data]) => ({
        providerId,
        providerName: data.providerName,
        email: data.email,
        totalAppointments: data.total,
        completedAppointments: data.completed,
        scheduledAppointments: data.scheduled,
        completionRate:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.totalAppointments - a.totalAppointments);
  }

  /**
   * Generates CSV report data string based on requested report type.
   */
  public static async generateCsvReport(
    organizationId: string,
    filters: AnalyticsQueryInput,
    reportType: string = 'overview'
  ): Promise<string> {
    const analytics = await this.getDashboardAnalytics(organizationId, filters);

    if (reportType === 'appointments') {
      const rows = [
        ['Date Bucket', 'Total Appointments', 'Completed', 'Cancelled', 'Missed'],
      ];
      for (let i = 0; i < analytics.appointmentTrends.total.length; i++) {
        const t = analytics.appointmentTrends.total[i];
        const c = analytics.appointmentTrends.completed[i]?.count || 0;
        const can = analytics.appointmentTrends.cancelled[i]?.count || 0;
        const m = analytics.appointmentTrends.missed[i]?.count || 0;
        rows.push([t.label, String(t.count), String(c), String(can), String(m)]);
      }
      return rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    }

    if (reportType === 'departments') {
      const rows = [
        ['Department', 'Total Appointments', 'Completed', 'Cancelled', 'Completion Rate (%)'],
      ];
      for (const d of analytics.departmentPerformance) {
        rows.push([
          d.department,
          String(d.totalAppointments),
          String(d.completedAppointments),
          String(d.cancelledAppointments),
          `${d.completionRate}%`,
        ]);
      }
      return rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    }

    if (reportType === 'providers') {
      const rows = [
        ['Provider Name', 'Email', 'Total Appointments', 'Completed', 'Pending', 'Completion Rate (%)'],
      ];
      for (const p of analytics.providerActivity) {
        rows.push([
          p.providerName,
          p.email,
          String(p.totalAppointments),
          String(p.completedAppointments),
          String(p.scheduledAppointments),
          `${p.completionRate}%`,
        ]);
      }
      return rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    }

    if (reportType === 'patients') {
      const rows = [
        ['Metric / Demographics Category', 'Value', 'Percentage / Details'],
        ['Total Registered Patients', String(analytics.summaryStats.totalRegisteredPatients), 'All time'],
        ['New Patients in Period', String(analytics.summaryStats.newPatients), 'In selected date range'],
        ['Gender: Male', String(analytics.patientDemographics.gender.male), '-'],
        ['Gender: Female', String(analytics.patientDemographics.gender.female), '-'],
        ['Gender: Other', String(analytics.patientDemographics.gender.other), '-'],
        ['Gender: Unspecified', String(analytics.patientDemographics.gender.unspecified), '-'],
      ];
      for (const age of analytics.patientDemographics.ageGroups) {
        rows.push([`Age Group: ${age.group}`, String(age.count), `${age.percentage}%`]);
      }
      return rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
    }

    // Default overview report
    const rows = [
      ['Metric', 'Value'],
      ['Organization Name', analytics.organizationName],
      ['Reporting Period Start', analytics.period.startDate],
      ['Reporting Period End', analytics.period.endDate],
      ['Granularity', analytics.period.granularity],
      ['Total Registered Patients', String(analytics.summaryStats.totalRegisteredPatients)],
      ['New Patients', String(analytics.summaryStats.newPatients)],
      ['Total Appointments', String(analytics.summaryStats.totalAppointments)],
      ['Completed Appointments', String(analytics.summaryStats.completedAppointments)],
      ['Pending Appointments', String(analytics.summaryStats.pendingAppointments)],
      ['Cancelled Appointments', String(analytics.summaryStats.cancelledAppointments)],
      ['Missed Appointments (No-Show)', String(analytics.summaryStats.missedAppointments)],
      ['Active Healthcare Providers', String(analytics.summaryStats.activeHealthcareProviders)],
      ['Overall Completion Rate', `${analytics.visitStatistics.overallCompletionRate}%`],
      ['Overall Cancellation Rate', `${analytics.visitStatistics.overallCancellationRate}%`],
      ['Overall No-Show Rate', `${analytics.visitStatistics.overallNoShowRate}%`],
      ['Average Consultation Duration', `${analytics.visitStatistics.averageDurationMinutes} mins`],
      ['Consultations (In Person)', String(analytics.visitStatistics.modeDistribution.inPerson)],
      ['Consultations (Virtual)', String(analytics.visitStatistics.modeDistribution.virtual)],
      ['Consultations (Telephone)', String(analytics.visitStatistics.modeDistribution.telephone)],
    ];

    return rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');
  }
}
