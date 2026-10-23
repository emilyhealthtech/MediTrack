'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Heart,
  ShieldAlert,
  Activity,
  Pill,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function StaffPatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resPatient, resHealth] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/patients/${patientId}`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/health-profile`, { credentials: 'include' }),
      ]);

      const jsonPatient = await resPatient.json();
      const jsonHealth = await resHealth.json();

      if (jsonPatient.success) {
        setPatient(jsonPatient.data);
      } else {
        setError(jsonPatient.error?.message || 'Failed to load patient record.');
      }

      if (jsonHealth.success) {
        setHealthProfile(jsonHealth.data);
      }
    } catch (err) {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const handleVerifyItem = async (type: 'allergy' | 'condition' | 'medication' | 'history', itemId: string) => {
    try {
      setVerifying(itemId);
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/${patientId}/health-profile/${type}/${itemId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verified: true }),
      });

      const json = await res.json();
      if (json.success) {
        fetchPatientData();
      } else {
        alert(json.error?.message || 'Failed to verify health record item.');
      }
    } catch (err) {
      alert('Error verifying item.');
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Navigation link */}
        <Link
          href="/staff/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </Link>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading clinical patient record...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Patient Header Summary */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-2xl">
                  {patient?.fullName?.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">{patient?.fullName}</h1>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        patient?.completionStatus?.isComplete
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {patient?.completionStatus?.isComplete ? 'Complete Profile' : 'Incomplete Profile'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-1">Patient Record ID: {patient?.id}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Email: {patient?.email} | Phone: {patient?.phoneNumber || 'N/A'} | DOB: {patient?.dateOfBirth || 'N/A'} | Gender: {patient?.gender || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 min-w-[200px]">
                <p className="font-bold text-slate-800">Clinical Quick View</p>
                <p className="text-slate-600">Blood Group: <span className="font-bold text-slate-900">{patient?.bloodGroup || 'N/A'}</span></p>
                <p className="text-slate-600">Genotype: <span className="font-bold text-slate-900">{patient?.genotype || 'N/A'}</span></p>
                <p className="text-slate-600">Emergency Phone: <span className="font-bold text-slate-900">{patient?.emergencyContactPhone || 'N/A'}</span></p>
              </div>
            </div>

            {/* Health Profile Sections with Verification Actions */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600" />
                Clinical Health Profile & Verification
              </h2>

              {/* Section 1: Allergies */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  Allergies ({healthProfile?.allergies?.length || 0})
                </h3>

                {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
                  <div className="space-y-3">
                    {healthProfile.allergies.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.allergen}</span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-rose-100 text-rose-800 rounded uppercase">
                              {item.severity}
                            </span>
                          </div>
                          {item.reaction && <p className="text-xs text-slate-600 mt-0.5">Reaction: {item.reaction}</p>}
                          <div className="mt-1">
                            {item.isVerifiedByClinician ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clinician Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
                                <Clock className="w-3.5 h-3.5 text-sky-600" /> Patient-Entered (Requires Verification)
                              </span>
                            )}
                          </div>
                        </div>

                        {!item.isVerifiedByClinician && (
                          <button
                            onClick={() => handleVerifyItem('allergy', item.id)}
                            disabled={verifying === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {verifying === item.id ? 'Verifying...' : 'Verify Record'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">No allergy records listed for this patient.</p>
                )}
              </div>

              {/* Section 2: Medical Conditions */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Medical Conditions ({healthProfile?.conditions?.length || 0})
                </h3>

                {healthProfile?.conditions && healthProfile.conditions.length > 0 ? (
                  <div className="space-y-3">
                    {healthProfile.conditions.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.conditionName}</span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded uppercase">
                              {item.status}
                            </span>
                          </div>
                          {item.notes && <p className="text-xs text-slate-600 mt-0.5">Notes: {item.notes}</p>}
                          <div className="mt-1">
                            {item.isVerifiedByClinician ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clinician Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
                                <Clock className="w-3.5 h-3.5 text-sky-600" /> Patient-Entered (Requires Verification)
                              </span>
                            )}
                          </div>
                        </div>

                        {!item.isVerifiedByClinician && (
                          <button
                            onClick={() => handleVerifyItem('condition', item.id)}
                            disabled={verifying === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {verifying === item.id ? 'Verifying...' : 'Verify Record'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">No medical condition records listed for this patient.</p>
                )}
              </div>

              {/* Section 3: Medications */}
              <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-600" />
                  Medications ({healthProfile?.medications?.length || 0})
                </h3>

                {healthProfile?.medications && healthProfile.medications.length > 0 ? (
                  <div className="space-y-3">
                    {healthProfile.medications.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.medicationName}</span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Dosage: {item.dosage || 'N/A'} | Frequency: {item.frequency || 'N/A'}
                          </p>
                          <div className="mt-1">
                            {item.isVerifiedByClinician ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clinician Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700">
                                <Clock className="w-3.5 h-3.5 text-sky-600" /> Patient-Entered (Requires Verification)
                              </span>
                            )}
                          </div>
                        </div>

                        {!item.isVerifiedByClinician && (
                          <button
                            onClick={() => handleVerifyItem('medication', item.id)}
                            disabled={verifying === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {verifying === item.id ? 'Verifying...' : 'Verify Record'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">No medication records listed for this patient.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
