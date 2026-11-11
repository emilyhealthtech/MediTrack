'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  Building2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Check,
  Ban,
  Play,
  RotateCcw,
  Clock,
  User,
  Eye,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  UserX,
  Download,
  Stethoscope,
  Info,
  History,
  Phone,
  Video,
  UserCheck,
  FileText,
  AlertCircle,
  CalendarCheck,
  Layers,
} from 'lucide-react';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Obstetrics & Gynecology',
  'Orthopedics',
  'Dermatology',
  'Ophthalmology',
  'Neurology',
  'ENT (Otolaryngology)',
  'Psychiatry',
  'Dental Surgery',
  'Emergency Care',
];

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // View state: 'table' or 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Calendar state
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown reference data
  const [patients, setPatients] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Selected item states
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Create Form State
  const [newPatientId, setNewPatientId] = useState('');
  const [newFacilityId, setNewFacilityId] = useState('');
  const [newDepartment, setNewDepartment] = useState('General Medicine');
  const [newProviderId, setNewProviderId] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newMode, setNewMode] = useState('IN_PERSON');
  const [newReason, setNewReason] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleDuration, setRescheduleDuration] = useState(30);
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel Form State
  const [cancellationReason, setCancellationReason] = useState('');

  // Availability Form State
  const [availFacilityId, setAvailFacilityId] = useState('');
  const [availProviderId, setAvailProviderId] = useState('');
  const [availDayOfWeek, setAvailDayOfWeek] = useState(1);
  const [availStartTime, setAvailStartTime] = useState('08:00');
  const [availEndTime, setAvailEndTime] = useState('17:00');
  const [availDuration, setAvailDuration] = useState(30);

  // Provider slots state for scheduling helper
  const [slotDate, setSlotDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchFacilitiesAndMembers();
  }, [statusFilter, departmentFilter, providerFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${API_BASE_URL}/api/v1/appointments`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);
      if (departmentFilter !== 'ALL') url.searchParams.append('department', departmentFilter);
      if (providerFilter !== 'ALL') url.searchParams.append('providerId', providerFilter);
      if (dateFilter) {
        url.searchParams.append('startDate', `${dateFilter}T00:00:00.000Z`);
        url.searchParams.append('endDate', `${dateFilter}T23:59:59.999Z`);
      }

      const res = await fetch(url.toString(), { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to load organization appointments.');
      }
    } catch (err) {
      setError('Network error when loading appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        setPatients(json.data);
        if (json.data.length > 0 && !newPatientId) {
          setNewPatientId(json.data[0].id);
        }
      }
    } catch (err) {
      // Ignore
    }
  };

  const fetchFacilitiesAndMembers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const org = json.data[0];
        setCurrentOrgId(org.id);
        if (org.facilities && org.facilities.length > 0) {
          setFacilities(org.facilities);
          setNewFacilityId(org.facilities[0].id);
          setAvailFacilityId(org.facilities[0].id);
        }

        // Fetch staff members for provider assignment
        const memRes = await fetch(`${API_BASE_URL}/api/v1/organizations/${org.id}/members`, {
          credentials: 'include',
        });
        const memJson = await memRes.json();
        if (memJson.success && memJson.data) {
          setMembers(memJson.data);
          if (memJson.data.length > 0) {
            setAvailProviderId(memJson.data[0].userId);
          }
        }
      }
    } catch (err) {
      // Ignore
    }
  };

  const fetchAppointmentDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setAppointmentDetails(json.data);
      } else {
        setError(json.error?.message || 'Failed to fetch appointment details.');
      }
    } catch (err) {
      setError('Network error loading appointment details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchAvailableSlots = async (fId: string, pId: string, dStr: string) => {
    if (!fId || !pId || !dStr) return;
    try {
      setLoadingSlots(true);
      const url = new URL(`${API_BASE_URL}/api/v1/appointments/availability/slots`);
      url.searchParams.append('facilityId', fId);
      url.searchParams.append('providerId', pId);
      url.searchParams.append('date', dStr);

      const res = await fetch(url.toString(), { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setAvailableSlots(json.data || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    let total = appointments.length;
    let today = 0;
    let upcoming = 0;
    let requested = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let missed = 0;

    appointments.forEach((a) => {
      const apptDateStr = new Date(a.scheduledAt).toISOString().split('T')[0];
      const apptDate = new Date(a.scheduledAt);

      if (apptDateStr === todayStr) today++;
      if (apptDate >= now && !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status)) {
        upcoming++;
      }

      if (a.status === 'REQUESTED') requested++;
      if (a.status === 'CONFIRMED') confirmed++;
      if (a.status === 'COMPLETED') completed++;
      if (a.status === 'CANCELLED') cancelled++;
      if (a.status === 'NO_SHOW') missed++;
    });

    return { total, today, upcoming, requested, confirmed, completed, cancelled, missed };
  }, [appointments]);

  // Client-side search filtering
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      const patientName = a.patient?.user?.fullName?.toLowerCase() || '';
      const patientEmail = a.patient?.user?.email?.toLowerCase() || '';
      const patientId = a.patient?.id?.toLowerCase() || '';
      const apptId = a.id?.toLowerCase() || '';
      const dept = a.department?.toLowerCase() || '';
      const provider = a.provider?.fullName?.toLowerCase() || '';
      const facility = a.facility?.name?.toLowerCase() || '';
      const reason = a.reason?.toLowerCase() || '';

      return (
        patientName.includes(q) ||
        patientEmail.includes(q) ||
        patientId.includes(q) ||
        apptId.includes(q) ||
        dept.includes(q) ||
        provider.includes(q) ||
        facility.includes(q) ||
        reason.includes(q)
      );
    });
  }, [appointments, searchQuery]);

  // Handle Form Submissions
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          patientId: newPatientId,
          facilityId: newFacilityId,
          department: newDepartment,
          providerId: newProviderId || undefined,
          scheduledAt: new Date(newScheduledAt).toISOString(),
          durationMinutes: Number(newDuration),
          mode: newMode,
          reason: newReason || undefined,
          notes: newNotes || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment booked successfully!');
        setShowCreateModal(false);
        setNewReason('');
        setNewNotes('');
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to book appointment. Time conflict or validation error.');
      }
    } catch (err) {
      setError('Network error while booking appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, notes?: string) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Appointment status updated to ${newStatus}.`);
        fetchAppointments();
        if (showDetailsModal && appointmentDetails?.id === id) {
          fetchAppointmentDetails(id);
        }
      } else {
        setError(json.error?.message || 'Failed to update appointment status.');
      }
    } catch (err) {
      setError('Network error updating appointment status.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/${selectedAppointment.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scheduledAt: new Date(rescheduleDate).toISOString(),
          durationMinutes: Number(rescheduleDuration),
          reason: rescheduleReason || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment rescheduled successfully.');
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to reschedule. Time conflict or validation error.');
      }
    } catch (err) {
      setError('Network error rescheduling appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/${selectedAppointment.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cancellationReason: cancellationReason || 'Cancelled by clinic administration',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment cancelled.');
        setShowCancelModal(false);
        setSelectedAppointment(null);
        setCancellationReason('');
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      setError('Network error cancelling appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          facilityId: availFacilityId,
          providerId: availProviderId,
          dayOfWeek: Number(availDayOfWeek),
          startTime: availStartTime,
          endTime: availEndTime,
          slotDurationMinutes: Number(availDuration),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Provider availability rule successfully saved.');
        setShowAvailabilityModal(false);
      } else {
        setError(json.error?.message || 'Failed to save provider availability rule.');
      }
    } catch (err) {
      setError('Network error saving availability.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Rendering Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" /> Requested
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-sky-100 text-sky-800 border border-sky-200">
            <CalendarDays className="w-3 h-3" /> Scheduled
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Play className="w-3 h-3" /> In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-slate-100 text-slate-800 border border-slate-300">
            <Check className="w-3 h-3" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-purple-100 text-purple-800 border border-purple-200">
            <UserX className="w-3 h-3" /> Missed (No-Show)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Calendar Helpers
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    if (calendarView === 'month') {
      const firstDayOfMonth = new Date(year, month, 1);
      const startingDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days: { date: Date; isCurrentMonth: boolean; appointments: any[] }[] = [];

      // Prev month filler
      const prevMonthDays = new Date(year, month, 0).getDate();
      for (let i = startingDayIndex - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthDays - i);
        days.push({ date: d, isCurrentMonth: false, appointments: [] });
      }

      // Current month
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const dayStr = d.toISOString().split('T')[0];
        const dayAppts = filteredAppointments.filter((a) => {
          const aStr = new Date(a.scheduledAt).toISOString().split('T')[0];
          return aStr === dayStr;
        });
        days.push({ date: d, isCurrentMonth: true, appointments: dayAppts });
      }

      // Next month filler to round up to complete week
      const remainingSlots = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
      for (let day = 1; day <= remainingSlots; day++) {
        const d = new Date(year, month + 1, day);
        days.push({ date: d, isCurrentMonth: false, appointments: [] });
      }

      return days;
    } else if (calendarView === 'week') {
      const currentDay = calendarDate.getDay();
      const diffToSunday = calendarDate.getDate() - currentDay;
      const weekStart = new Date(calendarDate);
      weekStart.setDate(diffToSunday);

      const days: { date: Date; isCurrentMonth: boolean; appointments: any[] }[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dayStr = d.toISOString().split('T')[0];
        const dayAppts = filteredAppointments.filter((a) => {
          const aStr = new Date(a.scheduledAt).toISOString().split('T')[0];
          return aStr === dayStr;
        });
        days.push({ date: d, isCurrentMonth: true, appointments: dayAppts });
      }
      return days;
    } else {
      // Day view
      const dayStr = calendarDate.toISOString().split('T')[0];
      const dayAppts = filteredAppointments.filter((a) => {
        const aStr = new Date(a.scheduledAt).toISOString().split('T')[0];
        return aStr === dayStr;
      });
      return [{ date: calendarDate, isCurrentMonth: true, appointments: dayAppts }];
    }
  }, [calendarDate, calendarView, filteredAppointments]);

  const navigateCalendar = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCalendarDate(new Date());
      return;
    }

    const newDate = new Date(calendarDate);
    if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCalendarDate(newDate);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Top Header & Actions */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 rounded-lg text-teal-800">
                <CalendarIcon className="w-6 h-6 text-teal-700" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Hospital Appointment Management
              </h1>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              Comprehensive clinical scheduling dashboard with real-time availability, conflict prevention, and full audit tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAvailabilityModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              Provider Working Hours
            </button>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setError(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-teal-500"
            >
              <Plus className="w-4 h-4" />
              Book New Appointment
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" /> {error}
            </span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overview Metric Cards (8 Core Metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-slate-500 font-medium block">Total</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{metrics.total}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-teal-600 font-medium block">Today</span>
            <span className="text-xl font-bold text-teal-800 mt-1 block">{metrics.today}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-blue-600 font-medium block">Upcoming</span>
            <span className="text-xl font-bold text-blue-800 mt-1 block">{metrics.upcoming}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-amber-600 font-medium block">Pending</span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">{metrics.requested}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-emerald-600 font-medium block">Confirmed</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">{metrics.confirmed}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-slate-600 font-medium block">Completed</span>
            <span className="text-xl font-bold text-slate-800 mt-1 block">{metrics.completed}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-rose-600 font-medium block">Cancelled</span>
            <span className="text-xl font-bold text-rose-700 mt-1 block">{metrics.cancelled}</span>
          </div>
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm text-center">
            <span className="text-xs text-purple-600 font-medium block">Missed</span>
            <span className="text-xl font-bold text-purple-700 mt-1 block">{metrics.missed}</span>
          </div>
        </div>

        {/* Control Toolbar: Search, Filters & View Toggle */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search appointments by Patient Name, ID, Provider, Department, or Reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* View Switcher (Table vs Calendar) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start lg:self-center">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar View
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1 text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">Missed (No-Show)</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Healthcare Providers</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  Dr./Staff: {m.user?.fullName}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-teal-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  title="Clear Date Filter"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(statusFilter !== 'ALL' || departmentFilter !== 'ALL' || providerFilter !== 'ALL' || dateFilter || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setDepartmentFilter('ALL');
                  setProviderFilter('ALL');
                  setDateFilter('');
                  setSearchQuery('');
                }}
                className="text-teal-700 hover:text-teal-900 font-semibold underline ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE CALENDAR */}
        {viewMode === 'calendar' ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  {calendarView === 'day' && ` ${calendarDate.getDate()}`}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateCalendar('prev')}
                    className="p-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600"
                    title="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateCalendar('today')}
                    className="px-2.5 py-1 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateCalendar('next')}
                    className="p-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-600"
                    title="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* View scale selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    calendarView === 'month' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    calendarView === 'week' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarView('day')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    calendarView === 'day' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Calendar Grid View */}
            {calendarView === 'month' && (
              <div className="mt-4">
                <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden text-center text-xs font-bold text-slate-700">
                  <div className="bg-slate-100 py-2">Sun</div>
                  <div className="bg-slate-100 py-2">Mon</div>
                  <div className="bg-slate-100 py-2">Tue</div>
                  <div className="bg-slate-100 py-2">Wed</div>
                  <div className="bg-slate-100 py-2">Thu</div>
                  <div className="bg-slate-100 py-2">Fri</div>
                  <div className="bg-slate-100 py-2">Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-px bg-slate-200 border-x border-b border-slate-200 rounded-b-lg overflow-hidden">
                  {calendarDays.map((item, idx) => {
                    const isToday =
                      item.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                    return (
                      <div
                        key={idx}
                        className={`min-h-[110px] p-2 bg-white flex flex-col justify-between ${
                          !item.isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold inline-block w-6 h-6 leading-6 text-center rounded-full ${
                              isToday ? 'bg-teal-700 text-white font-bold' : 'text-slate-800'
                            }`}
                          >
                            {item.date.getDate()}
                          </span>
                          {item.appointments.length > 0 && (
                            <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-1.5 rounded">
                              {item.appointments.length} appt{item.appointments.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mt-1 overflow-y-auto max-h-20">
                          {item.appointments.slice(0, 3).map((appt) => (
                            <div
                              key={appt.id}
                              onClick={() => fetchAppointmentDetails(appt.id)}
                              className="p-1 rounded text-[10px] bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 cursor-pointer truncate transition-colors"
                              title={`${appt.patient?.user?.fullName} (${appt.department}) - ${new Date(
                                appt.scheduledAt
                              ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            >
                              <strong>
                                {new Date(appt.scheduledAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </strong>{' '}
                              {appt.patient?.user?.fullName}
                            </div>
                          ))}
                          {item.appointments.length > 3 && (
                            <span className="text-[9px] text-slate-500 font-medium">
                              +{item.appointments.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {calendarView === 'week' && (
              <div className="mt-4 grid grid-cols-7 gap-2">
                {calendarDays.map((item, idx) => {
                  const isToday =
                    item.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg p-3 bg-white min-h-[300px] flex flex-col"
                    >
                      <div className="text-center pb-2 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-500 block">
                          {item.date.toLocaleDateString('default', { weekday: 'short' })}
                        </span>
                        <span
                          className={`text-sm font-bold inline-block px-2 py-0.5 rounded-full mt-0.5 ${
                            isToday ? 'bg-teal-700 text-white' : 'text-slate-900'
                          }`}
                        >
                          {item.date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-2 mt-2 flex-1 overflow-y-auto">
                        {item.appointments.map((appt) => (
                          <div
                            key={appt.id}
                            onClick={() => fetchAppointmentDetails(appt.id)}
                            className="p-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 cursor-pointer text-xs"
                          >
                            <span className="text-[10px] font-bold text-teal-800 block">
                              {new Date(appt.scheduledAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="font-semibold text-slate-900 block truncate">
                              {appt.patient?.user?.fullName}
                            </span>
                            <span className="text-[10px] text-slate-600 block">{appt.department}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {calendarView === 'day' && (
              <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Schedule for {calendarDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {calendarDays[0].appointments.length === 0 ? (
                  <p className="text-slate-500 text-xs py-8 text-center">No appointments scheduled for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {calendarDays[0].appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded">
                              {appt.durationMinutes} mins
                            </span>
                            {renderStatusBadge(appt.status)}
                          </div>
                          <p className="text-xs font-semibold text-slate-800">
                            Patient: {appt.patient?.user?.fullName} ({appt.patient?.user?.phoneNumber || 'No phone'})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Dept: {appt.department} | Provider: {appt.provider?.fullName || 'Unassigned'}
                          </p>
                        </div>
                        <button
                          onClick={() => fetchAppointmentDetails(appt.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* VIEW 2: APPOINTMENTS DATA TABLE */}
        {viewMode === 'table' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
                <p className="mt-3 text-slate-600 text-xs font-medium">Loading hospital appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-16 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Appointments Found</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  No appointments match the current search filters. You can book a new patient appointment using the button above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Appt & Patient Info</th>
                      <th className="p-4">Provider & Dept</th>
                      <th className="p-4">Appointment Schedule</th>
                      <th className="p-4">Type / Reason</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Appointment & Patient Info */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 text-sm block">
                              {a.patient?.user?.fullName || 'Patient Record'}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Patient ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] text-slate-700">{a.patient?.id?.slice(0, 8)}...</code>
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Appt ID: {a.id?.slice(0, 8)}...
                            </span>
                          </div>
                        </td>

                        {/* Healthcare Provider & Department */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {a.department}
                            </span>
                            <span className="text-[11px] text-slate-600 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {a.provider?.fullName ? `Dr. ${a.provider.fullName}` : 'Unassigned'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {a.facility?.name}
                            </span>
                          </div>
                        </td>

                        {/* Appointment Schedule & Date Created */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              {new Date(a.scheduledAt).toLocaleDateString([], {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium block">
                              {new Date(a.scheduledAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ({a.durationMinutes} mins)
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Booked on {new Date(a.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Type & Reason for Visit */}
                        <td className="p-4 max-w-xs">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded uppercase text-[10px]">
                              {a.mode === 'VIRTUAL' ? (
                                <Video className="w-3 h-3 text-purple-600" />
                              ) : a.mode === 'TELEPHONE' ? (
                                <Phone className="w-3 h-3 text-blue-600" />
                              ) : (
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                              )}
                              {a.mode}
                            </span>
                            {a.reason && (
                              <p className="text-[11px] text-slate-600 truncate" title={a.reason}>
                                {a.reason}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Appointment Status */}
                        <td className="p-4 whitespace-nowrap">
                          {renderStatusBadge(a.status)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Inspect Details */}
                            <button
                              onClick={() => fetchAppointmentDetails(a.id)}
                              title="View Details & Audit History"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Download iCalendar */}
                            <a
                              href={`${API_BASE_URL}/api/v1/appointments/${a.id}/ics`}
                              download
                              title="Download Calendar .ics"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            {/* Confirm */}
                            {(a.status === 'REQUESTED' || a.status === 'SCHEDULED') && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'CONFIRMED')}
                                title="Confirm Appointment"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Confirm
                              </button>
                            )}

                            {/* Start Session */}
                            {a.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'IN_PROGRESS')}
                                title="Start Clinical Session"
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" /> Start
                              </button>
                            )}

                            {/* Complete */}
                            {a.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                                title="Mark Encounter Completed"
                                className="px-2 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Complete
                              </button>
                            )}

                            {/* Mark Missed / No-Show */}
                            {(a.status === 'SCHEDULED' || a.status === 'CONFIRMED') && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'NO_SHOW', 'Patient did not arrive for scheduled slot.')}
                                title="Record Missed Appointment (No-Show)"
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded flex items-center gap-1 border border-purple-200"
                              >
                                <UserX className="w-3 h-3" /> Missed
                              </button>
                            )}

                            {/* Reschedule */}
                            {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(a.status) && (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(a);
                                  setRescheduleDuration(a.durationMinutes || 30);
                                  setShowRescheduleModal(true);
                                }}
                                title="Reschedule Appointment"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Cancel */}
                            {!['COMPLETED', 'CANCELLED'].includes(a.status) && (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(a);
                                  setShowCancelModal(true);
                                }}
                                title="Cancel Appointment"
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: BOOK NEW APPOINTMENT */}
        {/* ========================================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Schedule Patient Appointment</h3>
                    <p className="text-[11px] text-slate-500">Book new consultation with automated conflict prevention.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {/* Patient Selection */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName || p.user?.fullName} ({p.email || p.user?.email}) — ID: {p.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Facility Selection */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Healthcare Facility *</label>
                    <select
                      value={newFacilityId}
                      onChange={(e) => {
                        setNewFacilityId(e.target.value);
                        if (slotDate && newProviderId) {
                          fetchAvailableSlots(e.target.value, newProviderId, slotDate);
                        }
                      }}
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                    <select
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Healthcare Provider */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Clinician / Provider</label>
                    <select
                      value={newProviderId}
                      onChange={(e) => {
                        setNewProviderId(e.target.value);
                        if (slotDate && newFacilityId) {
                          fetchAvailableSlots(newFacilityId, e.target.value, slotDate);
                        }
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Any Available Clinician</option>
                      {members.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          Dr. {m.user?.fullName} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consultation Mode */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consultation Mode *</label>
                    <select
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="IN_PERSON">In Person (Hospital Clinic)</option>
                      <option value="VIRTUAL">Virtual (Telehealth Video)</option>
                      <option value="TELEPHONE">Telephone Consultation</option>
                    </select>
                  </div>
                </div>

                {/* Provider Availability Slot Checker */}
                {newProviderId && newFacilityId && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Check Provider Available Slots
                      </span>
                      <input
                        type="date"
                        value={slotDate}
                        onChange={(e) => {
                          setSlotDate(e.target.value);
                          fetchAvailableSlots(newFacilityId, newProviderId, e.target.value);
                        }}
                        className="p-1 border border-slate-300 rounded text-xs bg-white"
                      />
                    </div>
                    {loadingSlots ? (
                      <p className="text-[10px] text-slate-500">Checking slot availability...</p>
                    ) : availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                        {availableSlots.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={!s.available}
                            onClick={() => {
                              const d = new Date(s.startTime);
                              // Format for datetime-local
                              const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                                .toISOString()
                                .slice(0, 16);
                              setNewScheduledAt(localIso);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                              s.available
                                ? 'bg-white hover:bg-teal-50 border-teal-300 text-teal-800'
                                : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </button>
                        ))}
                      </div>
                    ) : slotDate ? (
                      <p className="text-[10px] text-amber-700">No working schedule or open slots defined for this day.</p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Pick a date above to view provider open slots.</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Scheduled Date & Time */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={newScheduledAt}
                      onChange={(e) => setNewScheduledAt(e.target.value)}
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Duration Minutes */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      min={10}
                      max={240}
                      step={5}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="e.g. Routine hypertension checkup, persistent cough, lab review"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                    placeholder="Optional administrative or clinical scheduling notes..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm"
                  >
                    {submitting ? 'Booking Appointment...' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: APPOINTMENT DETAILS & AUDIT HISTORY */}
        {/* ========================================================================= */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Appointment Record & Audit Trail</h3>
                    <p className="text-[11px] text-slate-500">ID: {appointmentDetails?.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setAppointmentDetails(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingDetails || !appointmentDetails ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
                  <p className="mt-2 text-slate-500 text-xs">Loading appointment details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Current Status:</span>
                      {renderStatusBadge(appointmentDetails.status)}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Created: {new Date(appointmentDetails.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Patient Details</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        {appointmentDetails.patient?.user?.fullName}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Email: {appointmentDetails.patient?.user?.email}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Phone: {appointmentDetails.patient?.user?.phoneNumber || 'N/A'}
                      </p>
                      <p className="text-slate-500 text-[10px] mt-1">
                        Patient ID: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{appointmentDetails.patientId}</code>
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Provider & Facility</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        {appointmentDetails.provider ? `Dr. ${appointmentDetails.provider.fullName}` : 'Unassigned'}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Dept: <span className="font-semibold text-slate-800">{appointmentDetails.department}</span>
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Facility: {appointmentDetails.facility?.name} ({appointmentDetails.facility?.city})
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Schedule & Mode</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {new Date(appointmentDetails.scheduledAt).toLocaleString()}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Duration: {appointmentDetails.durationMinutes} minutes ({appointmentDetails.timeZone})
                      </p>
                      <p className="text-slate-600 text-[11px] capitalize">
                        Mode: <strong>{appointmentDetails.mode}</strong>
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-500 block text-[11px]">Reason for Visit</span>
                      <p className="text-slate-800 font-medium mt-0.5">
                        {appointmentDetails.reason || 'None provided'}
                      </p>
                      {appointmentDetails.notes && (
                        <p className="text-slate-600 text-[11px] mt-1 bg-white p-2 rounded border border-slate-200">
                          <strong>Notes:</strong> {appointmentDetails.notes}
                        </p>
                      )}
                      {appointmentDetails.cancellationReason && (
                        <p className="text-rose-700 text-[11px] mt-1 bg-rose-50 p-2 rounded border border-rose-200">
                          <strong>Cancellation Reason:</strong> {appointmentDetails.cancellationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Audit Event History */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                      <History className="w-4 h-4 text-teal-700" />
                      Immutable Audit Trail & Change Log
                    </h4>

                    {appointmentDetails.auditTrail && appointmentDetails.auditTrail.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {appointmentDetails.auditTrail.map((ev: any) => (
                          <div key={ev.id} className="p-3 bg-white flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{ev.action}</span>
                                <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {ev.user?.fullName || 'System'}
                                </span>
                              </div>
                              {ev.detailsJson && (
                                <p className="text-[11px] text-slate-500 mt-1 font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                                  {ev.detailsJson}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(ev.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs italic">No audit trail records found for this appointment.</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: RESCHEDULE APPOINTMENT */}
        {/* ========================================================================= */}
        {showRescheduleModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">
                  Patient: {selectedAppointment.patient?.user?.fullName}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Current Schedule: {new Date(selectedAppointment.scheduledAt).toLocaleString()}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Clinician: {selectedAppointment.provider?.fullName ? `Dr. ${selectedAppointment.provider.fullName}` : 'Unassigned'}
                </p>
              </div>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={10}
                    max={240}
                    step={5}
                    value={rescheduleDuration}
                    onChange={(e) => setRescheduleDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Rescheduling</label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="e.g. Patient conflict, clinician emergency, room availability"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !rescheduleDate}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
                  >
                    {submitting ? 'Rescheduling...' : 'Confirm New Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: CANCEL APPOINTMENT */}
        {/* ========================================================================= */}
        {showCancelModal && selectedAppointment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
                    <Ban className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
                </div>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold">
                  {selectedAppointment.patient?.user?.fullName} — {selectedAppointment.department}
                </p>
                <p className="text-[11px]">
                  Scheduled for {new Date(selectedAppointment.scheduledAt).toLocaleString()}
                </p>
              </div>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Cancellation *</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Specify the reason why this appointment is being cancelled..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Keep Appointment
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !cancellationReason.trim()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: SET PROVIDER AVAILABILITY */}
        {/* ========================================================================= */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Provider Working Hours & Availability</h3>
                    <p className="text-[11px] text-slate-500">Configure clinician consultation hours to enable slot booking.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSetAvailabilitySubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility *</label>
                  <select
                    value={availFacilityId}
                    onChange={(e) => setAvailFacilityId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinician / Provider *</label>
                  <select
                    value={availProviderId}
                    onChange={(e) => setAvailProviderId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        Dr. {m.user?.fullName} ({m.user?.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of the Week *</label>
                  <select
                    value={availDayOfWeek}
                    onChange={(e) => setAvailDayOfWeek(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Time (HH:MM) *</label>
                    <input
                      type="text"
                      pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                      value={availStartTime}
                      onChange={(e) => setAvailStartTime(e.target.value)}
                      placeholder="08:00"
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Time (HH:MM) *</label>
                    <input
                      type="text"
                      pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                      value={availEndTime}
                      onChange={(e) => setAvailEndTime(e.target.value)}
                      placeholder="17:00"
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slot Duration (Minutes)</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    step={5}
                    value={availDuration}
                    onChange={(e) => setAvailDuration(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAvailabilityModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm"
                  >
                    {submitting ? 'Saving...' : 'Save Availability Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
