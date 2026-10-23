'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Calendar,
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
} from 'lucide-react';

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [providerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [mode, setMode] = useState('IN_PERSON');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lists for dropdowns
  const [patients, setPatients] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchFacilities();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/api/v1/appointments`);
      if (statusFilter !== 'ALL') url.searchParams.append('status', statusFilter);

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
      if (json.success) {
        setPatients(json.data || []);
        if (json.data?.length > 0) setPatientId(json.data[0].id);
      }
    } catch (err) {
      // Ignore
    }
  };

  const fetchFacilities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        const facs: any[] = [];
        json.data.forEach((org: any) => {
          if (org.facilities) {
            org.facilities.forEach((f: any) => facs.push(f));
          }
        });
        setFacilities(facs);
        if (facs.length > 0) setFacilityId(facs[0].id);
      }
    } catch (err) {
      // Ignore
    }
  };

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
          patientId,
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
        setSuccessMsg('Appointment booked successfully.');
        setShowCreateModal(false);
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to book appointment.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Status updated to ${newStatus}`);
        fetchAppointments();
      } else {
        setError(json.error?.message || 'Failed to update status.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patient?.user?.fullName?.toLowerCase().includes(q) ||
      a.department?.toLowerCase().includes(q) ||
      a.facility?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-teal-700" />
              Facility Appointment Schedule
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage clinical appointments, provider schedules, and consultation status workflows across your organization.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Schedule Patient Appointment
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

        {/* Filter Toolbar */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by patient name, department, or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="REQUESTED">Requested</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading appointment schedule...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Appointments Match Filter</h3>
            <p className="text-slate-500 text-sm mt-1">Try resetting search filters or schedule a new appointment.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-4">Patient</th>
                    <th className="p-4">Scheduled Date & Time</th>
                    <th className="p-4">Facility / Dept</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">
                        {a.patient?.user?.fullName || 'Patient Record'}
                        <p className="text-[10px] text-slate-500 font-normal">{a.patient?.user?.email}</p>
                      </td>
                      <td className="p-4 text-slate-800 font-medium">
                        {new Date(a.scheduledAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{a.department}</p>
                        <p className="text-[10px] text-slate-500">{a.facility?.name}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded uppercase text-[10px]">
                          {a.mode}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold px-2.5 py-1 rounded-full text-[10px] ${
                            a.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : a.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : a.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800'
                              : a.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.status === 'REQUESTED' && (
                            <button
                              onClick={() => handleStatusChange(a.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                          )}
                          {a.status === 'SCHEDULED' && (
                            <button
                              onClick={() => handleStatusChange(a.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                          )}
                          {a.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusChange(a.id, 'IN_PROGRESS')}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Start Session
                            </button>
                          )}
                          {a.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </button>
                          )}
                          {!['COMPLETED', 'CANCELLED'].includes(a.status) && (
                            <button
                              onClick={() => handleStatusChange(a.id, 'CANCELLED')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" /> Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Schedule Patient Appointment */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Schedule Patient Appointment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility</label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} - {f.city}
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
                    <label className="block font-semibold text-slate-700 mb-1">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      <option value="IN_PERSON">In Person</option>
                      <option value="VIRTUAL">Virtual</option>
                      <option value="TELEPHONE">Telephone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Consultation</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3">
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
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Appointment'}
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
