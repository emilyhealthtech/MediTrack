'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  User,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Pill,
  Activity,
  FileText,
  Clock,
  Building2,
} from 'lucide-react';

export default function PatientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/dashboard`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error?.message || 'Failed to load dashboard data.');
        }
      } catch (err: any) {
        setError('Unable to connect to the server. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Patient Portal Dashboard
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Welcome back, {data?.profile?.fullName || 'Patient'}. Manage your personal health records and appointments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/patient/health-profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-teal-500"
            >
              <Heart className="w-4 h-4" />
              Manage Health Profile
            </Link>
            <Link
              href="/patient/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-all"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading your health dashboard...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Unable to display dashboard</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Completion Alert Banner */}
            {!data?.completionStatus?.isComplete && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-amber-900">
                      Incomplete Patient Profile ({data?.completionStatus?.completionPercentage}% Completed)
                    </h3>
                    <p className="text-sm text-amber-800 mt-0.5">
                      Missing fields:{' '}
                      <span className="font-medium">
                        {data?.completionStatus?.missingFields?.join(', ')}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href="/patient/profile"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap text-center"
                >
                  Complete Profile Now
                </Link>
              </div>
            )}

            {/* Health Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allergies</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.healthSummary?.allergiesCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Recorded allergens</p>
                </div>
                <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Medical Conditions</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.healthSummary?.conditionsCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Diagnosed or reported</p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Medications</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.healthSummary?.medicationsCount || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Current prescriptions</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Pill className="w-6 h-6" />
                </div>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification Status</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {data?.healthSummary?.unverifiedCount === 0 ? (
                      <span className="text-emerald-600 text-lg flex items-center gap-1">
                        <CheckCircle2 className="w-5 h-5" /> Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 text-lg">
                        {data?.healthSummary?.unverifiedCount} Unverified
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Clinician verification</p>
                </div>
                <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Appointments Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-700" />
                      Upcoming Appointments
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      Legitimate DB Source
                    </span>
                  </div>

                  {data?.upcomingAppointments && data.upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {data.upcomingAppointments.map((appt: any) => (
                        <div
                          key={appt.id}
                          className="p-4 border border-slate-200 rounded-lg hover:border-teal-500 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{appt.department}</span>
                              <span className="text-xs font-medium px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md uppercase">
                                {appt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {appt.facility?.name || 'Healthcare Facility'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(appt.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          {appt.reason && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded max-w-xs">
                              Reason: {appt.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                      <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No Upcoming Appointments</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        You currently have no scheduled appointments. You can connect with a verified healthcare facility to request appointment slots.
                      </p>
                      <Link
                        href="/select-context"
                        className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        Explore Facilities & Connect <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Notifications Card */}
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-700" />
                    Patient Notifications & Updates
                  </h2>
                  {data?.notifications && data.notifications.length > 0 ? (
                    <div className="space-y-3">
                      {data.notifications.map((notif: any) => (
                        <div key={notif.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                          <p className="font-semibold text-slate-900">{notif.subject || 'System Notification'}</p>
                          <p className="text-slate-600 mt-1">{notif.content}</p>
                          <p className="text-slate-400 text-[10px] mt-2">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">No recent notifications.</p>
                  )}
                </div>
              </div>

              {/* Sidebar Quick Summary & Actions */}
              <div className="space-y-6">
                <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Patient Profile Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-medium text-slate-900">{data?.profile?.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-slate-900">{data?.profile?.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Blood Group</span>
                      <span className="font-medium text-slate-900">{data?.profile?.bloodGroup || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Genotype</span>
                      <span className="font-medium text-slate-900">{data?.profile?.genotype || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Emergency Contact</span>
                      <span className="font-medium text-slate-900">
                        {data?.profile?.emergencyContactName
                          ? `${data.profile.emergencyContactName} (${data.profile.emergencyContactPhone || ''})`
                          : data?.profile?.emergencyContact || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/patient/profile"
                    className="w-full mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Update Demographic Details
                  </Link>
                </div>

                <div className="p-6 bg-slate-900 text-white rounded-xl shadow-md">
                  <h3 className="text-base font-bold text-white mb-2">Privacy & Consent</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Your personal health information is strictly protected under the Nigerian Data Protection Act (NDPA 2023). Only authorized clinical staff in connected healthcare facilities can view your verified health profile.
                  </p>
                  <Link
                    href="/privacy"
                    className="text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1"
                  >
                    Read Privacy Policy <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
