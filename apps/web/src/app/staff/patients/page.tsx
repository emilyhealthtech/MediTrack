'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function StaffPatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [completionFilter, setCompletionFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // Registration Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [newPatientForm, setNewPatientForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: '',
    genotype: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery) params.set('query', searchQuery);
      if (completionFilter !== 'ALL') params.set('completionStatus', completionFilter);
      if (genderFilter !== 'ALL') params.set('gender', genderFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/patients?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setPatients(json.data);
        setPagination(json.pagination);
      } else {
        setError(json.error?.message || 'Failed to load patient directory.');
      }
    } catch (err) {
      setError('Unable to load patient directory from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [completionFilter, genderFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDuplicateError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPatientForm),
      });

      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        setNewPatientForm({
          fullName: '',
          email: '',
          phoneNumber: '',
          dateOfBirth: '',
          gender: 'MALE',
          bloodGroup: '',
          genotype: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
        fetchPatients();
      } else if (json.error?.code === 'DUPLICATE_PATIENT_RECORD') {
        setDuplicateError(json.error.message);
      } else {
        alert(json.error?.message || 'Failed to register patient record.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-teal-700" />
              Patient Records Management
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Search, filter, register, and review patient records for your active organization.
            </p>
          </div>
          <button
            onClick={() => {
              setDuplicateError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-teal-500"
          >
            <PlusCircle className="w-4 h-4" />
            Register Patient Record
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients by Name, Email, Phone, or Patient ID..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={completionFilter}
                onChange={(e) => setCompletionFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Completion Statuses</option>
                <option value="COMPLETE">Complete Profiles (100%)</option>
                <option value="INCOMPLETE">Incomplete Profiles</option>
              </select>
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        {/* Patient Table */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Searching patient records...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-xl">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No Patient Records Found</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              No matching patient records found in your active organization. You can create a new patient record using the button above.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Patient Name & ID</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Demographics</th>
                    <th className="py-3.5 px-4">Profile Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{p.fullName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">ID: {p.id}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-xs text-slate-800">{p.email}</p>
                        <p className="text-xs text-slate-500">{p.phoneNumber || 'No phone'}</p>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <p>DOB: {p.dateOfBirth || 'N/A'}</p>
                        <p>Gender: {p.gender || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              p.completionStatus?.isComplete
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.completionStatus?.isComplete ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Complete (100%)
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3 h-3" /> Incomplete ({p.completionStatus?.completionPercentage}%)
                              </>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/staff/patients/${p.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-lg transition-colors"
                        >
                          View Record <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {patients.length} of {pagination.total} patient records
                </span>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Dialog for Patient Registration */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-700" />
                  Register New Patient Record
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Duplicate Prevention Alert */}
              {duplicateError && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Duplicate Match Prevention Triggered</p>
                    <p className="mt-1">{duplicateError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newPatientForm.fullName}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, fullName: e.target.value })}
                      placeholder="First and Last name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newPatientForm.email}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newPatientForm.phoneNumber}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, phoneNumber: e.target.value })}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newPatientForm.dateOfBirth}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={newPatientForm.gender}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={newPatientForm.bloodGroup}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="font-bold text-slate-800 mb-2">Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newPatientForm.emergencyContactName}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, emergencyContactName: e.target.value })
                      }
                      placeholder="Contact Name"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      value={newPatientForm.emergencyContactPhone}
                      onChange={(e) =>
                        setNewPatientForm({ ...newPatientForm, emergencyContactPhone: e.target.value })
                      }
                      placeholder="Contact Phone"
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {submitting ? 'Creating Record...' : 'Create Patient Record'}
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
