'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  FileText,
  Calendar,
  Building2,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function PatientClinicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClinicalRecords() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/v1/encounters/me`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success) {
          setRecords(json.data || []);
        } else {
          setError(json.error?.message || 'Failed to load clinical records.');
        }
      } catch (err) {
        setError('Network error when loading clinical records.');
      } finally {
        setLoading(false);
      }
    }
    fetchClinicalRecords();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-teal-700" />
            Clinical Records & Encounters
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Access signed clinical consultation notes, diagnostic assessments, and vital signs recorded by authorized healthcare providers.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading clinical records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Clinical Records Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              You currently have no signed clinical consultation summaries in your file. Note that draft or confidential clinician notes are not visible on patient portal summaries.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((rec) => (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        Consultation Summary
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed & Finalized
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {new Date(rec.encounterDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {rec.facilityName || 'Healthcare Facility'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Clinician: <strong>{rec.clinicianName || 'Attending Physician'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals Summary */}
                {rec.vitals && (
                  <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-600" /> Recorded Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {rec.vitals.bloodPressureSystolic && (
                        <div>
                          <span className="text-slate-500">Blood Pressure:</span>{' '}
                          <strong className="text-slate-800">
                            {rec.vitals.bloodPressureSystolic}/{rec.vitals.bloodPressureDiastolic} mmHg
                          </strong>
                        </div>
                      )}
                      {rec.vitals.heartRateBpm && (
                        <div>
                          <span className="text-slate-500">Heart Rate:</span>{' '}
                          <strong className="text-slate-800">{rec.vitals.heartRateBpm} bpm</strong>
                        </div>
                      )}
                      {rec.vitals.temperatureCelsius && (
                        <div>
                          <span className="text-slate-500">Temperature:</span>{' '}
                          <strong className="text-slate-800">{rec.vitals.temperatureCelsius} °C</strong>
                        </div>
                      )}
                      {rec.vitals.oxygenSaturationPercent && (
                        <div>
                          <span className="text-slate-500">Oxygen Saturation:</span>{' '}
                          <strong className="text-slate-800">{rec.vitals.oxygenSaturationPercent}%</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinical SOAP Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                  {rec.chiefComplaint && (
                    <div className="p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="font-bold text-slate-700">Chief Complaint</p>
                      <p className="text-slate-600 mt-1">{rec.chiefComplaint}</p>
                    </div>
                  )}
                  {rec.historyOfPresentIllness && (
                    <div className="p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="font-bold text-slate-700">History of Present Illness</p>
                      <p className="text-slate-600 mt-1">{rec.historyOfPresentIllness}</p>
                    </div>
                  )}
                  {rec.assessment && (
                    <div className="p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="font-bold text-slate-700">Clinical Assessment</p>
                      <p className="text-slate-600 mt-1">{rec.assessment}</p>
                    </div>
                  )}
                  {rec.plan && (
                    <div className="p-3 bg-white border border-slate-100 rounded-lg">
                      <p className="font-bold text-slate-700">Treatment Plan & Recommendations</p>
                      <p className="text-slate-600 mt-1">{rec.plan}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Signed by {rec.signedByName || rec.clinicianName} on {new Date(rec.signedAt || rec.encounterDate).toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Statutory Read-Only Copy</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
