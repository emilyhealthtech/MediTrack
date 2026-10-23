'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Calendar,
  Clock,
  Building2,
  User,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  CalendarX,
  RefreshCw,
  Video,
  Phone,
  UserCheck,
} from 'lucide-react';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<string | null>(null);

  // Form states
  const [facilityId, setFacilityId] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [providerId, setProviderId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState<'IN_PERSON' | 'VIRTUAL' | 'TELEPHONE'>('IN_PERSON');
  const [reason, setReason] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Facilities list for booking select
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchFacilities();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/me`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data || []);
      } else {
        setError(json.error?.message || 'Failed to load appointments.');
      }
    } catch (err) {
      setError('Network error when loading appointments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        // Flatten facilities across organizations
        const facs: any[] = [];
        json.data.forEach((org: any) => {
          if (org.facilities) {
            org.facilities.forEach((f: any) => {
              facs.push({ ...f, orgName: org.name });
            });
          }
        });
        setFacilities(facs);
        if (facs.length > 0) setFacilityId(facs[0].id);
      }
    } catch (err) {
      // Ignore
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          facilityId,
          department,
          providerId: providerId || undefined,
          scheduledAt: new Date(scheduledAt).toISOString(),
          mode,
          reason,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment booked successfully!');
        setShowBookModal(false);
        setReason('');
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to book appointment. Check for time slot conflicts.');
      }
    } catch (err) {
      setError('Network error during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = async (id: string) => {
    if (!cancellationReason.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/me/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cancellationReason }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment cancelled.');
        setShowCancelModal(null);
        setCancellationReason('');
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to cancel appointment.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (id: string) => {
    if (!rescheduleTime) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/me/${id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scheduledAt: new Date(rescheduleTime).toISOString() }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Appointment rescheduled successfully.');
        setShowRescheduleModal(null);
        setRescheduleTime('');
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to reschedule appointment. Slot may be occupied.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-teal-700" />
              My Appointments
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Schedule, track, and manage your consultation appointments with connected healthcare facilities.
            </p>
          </div>
          <button
            onClick={() => setShowBookModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Book New Appointment
          </button>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-5 h-5 text-red-600" /> {error}
            </span>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Appointments Scheduled</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              You currently have no past or upcoming appointments. Click the button below to book a consultation.
            </p>
            <button
              onClick={() => setShowBookModal(true)}
              className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md">
                      {appt.department}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        appt.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'SCHEDULED'
                          ? 'bg-blue-100 text-blue-800'
                          : appt.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    {appt.facility?.name || 'Healthcare Facility'}
                  </h3>

                  <div className="space-y-2 mt-4 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span className="font-medium text-slate-800">
                        {new Date(appt.scheduledAt).toLocaleString()} ({appt.timeZone || 'WAT'})
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      {appt.mode === 'VIRTUAL' ? (
                        <Video className="w-4 h-4 text-purple-600" />
                      ) : appt.mode === 'TELEPHONE' ? (
                        <Phone className="w-4 h-4 text-blue-600" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>Mode: <strong className="text-slate-800">{appt.mode}</strong> ({appt.durationMinutes} mins)</span>
                    </p>
                    {appt.provider && (
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Clinician: <strong className="text-slate-800">{appt.provider.fullName}</strong></span>
                      </p>
                    )}
                    {appt.reason && (
                      <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 text-slate-700">
                        <strong>Reason:</strong> {appt.reason}
                      </p>
                    )}
                    {appt.cancellationReason && (
                      <p className="bg-rose-50 p-2.5 rounded-lg border border-rose-100 text-rose-800 mt-2">
                        <strong>Cancellation Note:</strong> {appt.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {!['COMPLETED', 'CANCELLED'].includes(appt.status) && (
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setShowRescheduleModal(appt.id)}
                      className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      onClick={() => setShowCancelModal(appt.id)}
                      className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <CalendarX className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Book Appointment */}
        {showBookModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Book New Appointment</h3>
                <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Healthcare Facility</label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.orgName}) - {f.city}, {f.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consultation Mode</label>
                    <select
                      value={mode}
                      onChange={(e: any) => setMode(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="IN_PERSON">In Person</option>
                      <option value="VIRTUAL">Virtual (Video)</option>
                      <option value="TELEPHONE">Telephone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Requested Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Appointment</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Describe symptoms or purpose of consultation..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
                  >
                    {submitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cancel Appointment */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
              <p className="text-slate-600">Please state the reason for cancelling this appointment.</p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                placeholder="Reason for cancellation..."
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => handleCancelSubmit(showCancelModal)}
                  disabled={submitting || !cancellationReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
                >
                  {submitting ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reschedule Appointment */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date & Time</label>
                <input
                  type="datetime-local"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRescheduleModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRescheduleSubmit(showRescheduleModal)}
                  disabled={submitting || !rescheduleTime}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
                >
                  {submitting ? 'Updating...' : 'Reschedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
