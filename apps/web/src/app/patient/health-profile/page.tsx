'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Heart,
  ShieldAlert,
  Activity,
  Pill,
  FileText,
  CheckCircle2,
  PlusCircle,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  X,
  Clock,
} from 'lucide-react';

export default function PatientHealthProfilePage() {
  const [loading, setLoading] = useState(true);
  const [healthProfile, setHealthProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'allergies' | 'conditions' | 'medications' | 'history'>('allergies');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states for adding health profile items
  const [allergyForm, setAllergyForm] = useState({ allergen: '', severity: 'MODERATE', reaction: '' });
  const [conditionForm, setConditionForm] = useState({ conditionName: '', diagnosedDate: '', status: 'ACTIVE', notes: '' });
  const [medicationForm, setMedicationForm] = useState({ medicationName: '', dosage: '', frequency: '', status: 'ACTIVE' });
  const [historyForm, setHistoryForm] = useState({ title: '', category: 'GENERAL', eventDate: '', description: '' });

  const fetchHealthProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setHealthProfile(json.data);
      } else {
        setError(json.error?.message || 'Failed to fetch health profile.');
      }
    } catch (err) {
      setError('Unable to load health profile from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile/allergies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(allergyForm),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setAllergyForm({ allergen: '', severity: 'MODERATE', reaction: '' });
        fetchHealthProfile();
      } else {
        alert(json.error?.message || 'Failed to add allergy.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile/conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(conditionForm),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setConditionForm({ conditionName: '', diagnosedDate: '', status: 'ACTIVE', notes: '' });
        fetchHealthProfile();
      } else {
        alert(json.error?.message || 'Failed to add condition.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(medicationForm),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setMedicationForm({ medicationName: '', dosage: '', frequency: '', status: 'ACTIVE' });
        fetchHealthProfile();
      } else {
        alert(json.error?.message || 'Failed to add medication.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(historyForm),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setHistoryForm({ title: '', category: 'GENERAL', eventDate: '', description: '' });
        fetchHealthProfile();
      } else {
        alert(json.error?.message || 'Failed to add history entry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to remove this health record entry?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/patients/me/health-profile/${type}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        fetchHealthProfile();
      } else {
        alert(json.error?.message || 'Failed to delete record.');
      }
    } catch (err) {
      alert('Error deleting item.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full">
        {/* Navigation link */}
        <Link
          href="/patient/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Dashboard
        </Link>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-rose-600" />
              Patient Health Profile
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Organized record of your allergies, medical conditions, medications, and medical history.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-teal-500"
          >
            <PlusCircle className="w-4 h-4" />
            Add {activeTab === 'allergies' ? 'Allergy' : activeTab === 'conditions' ? 'Condition' : activeTab === 'medications' ? 'Medication' : 'Medical History'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('allergies')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'allergies'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Allergies ({healthProfile?.allergies?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('conditions')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'conditions'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Medical Conditions ({healthProfile?.conditions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'medications'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            Medications ({healthProfile?.medications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Medical History ({healthProfile?.medicalHistory?.length || 0})
          </button>
        </div>

        {/* Legend Banner */}
        <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Verification Source Legend:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-800 font-semibold rounded-md border border-sky-200">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> Patient Entered
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clinician Verified
            </span>
          </div>
          <span className="text-slate-500">Patient-entered items can be verified by healthcare staff upon appointment.</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-3 text-slate-600 text-sm font-medium">Loading health profile information...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : (
          <div>
            {/* TAB 1: ALLERGIES */}
            {activeTab === 'allergies' && (
              <div className="space-y-4">
                {healthProfile?.allergies && healthProfile.allergies.length > 0 ? (
                  healthProfile.allergies.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-base">{item.allergen}</h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              item.severity === 'SEVERE' || item.severity === 'LIFE_THREATENING'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.severity} SEVERITY
                          </span>
                        </div>
                        {item.reaction && <p className="text-xs text-slate-600">Reaction: {item.reaction}</p>}
                        <div className="pt-2 flex items-center gap-2">
                          {item.isVerifiedByClinician ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Clinician Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                              <Clock className="w-3.5 h-3.5" /> Patient Entered (Pending Verification)
                            </span>
                          )}
                        </div>
                      </div>

                      {!item.isVerifiedByClinician && (
                        <button
                          onClick={() => handleDeleteItem('allergies', item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-center"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                    <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Recorded Allergies</p>
                    <p className="text-xs text-slate-500 mt-1">
                      You have not listed any allergies yet. Click "Add Allergy" to record any known medical or food allergies.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CONDITIONS */}
            {activeTab === 'conditions' && (
              <div className="space-y-4">
                {healthProfile?.conditions && healthProfile.conditions.length > 0 ? (
                  healthProfile.conditions.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-base">{item.conditionName}</h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full uppercase">
                            {item.status}
                          </span>
                        </div>
                        {item.diagnosedDate && (
                          <p className="text-xs text-slate-500">Diagnosed: {item.diagnosedDate}</p>
                        )}
                        {item.notes && <p className="text-xs text-slate-600">Notes: {item.notes}</p>}
                        <div className="pt-2 flex items-center gap-2">
                          {item.isVerifiedByClinician ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Clinician Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                              <Clock className="w-3.5 h-3.5" /> Patient Entered
                            </span>
                          )}
                        </div>
                      </div>

                      {!item.isVerifiedByClinician && (
                        <button
                          onClick={() => handleDeleteItem('conditions', item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-center"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                    <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Reported Conditions</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No active or chronic medical conditions recorded.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MEDICATIONS */}
            {activeTab === 'medications' && (
              <div className="space-y-4">
                {healthProfile?.medications && healthProfile.medications.length > 0 ? (
                  healthProfile.medications.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-base">{item.medicationName}</h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full uppercase">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Dosage: {item.dosage || 'Not specified'} | Frequency: {item.frequency || 'Not specified'}
                        </p>
                        <div className="pt-2 flex items-center gap-2">
                          {item.isVerifiedByClinician ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Clinician Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                              <Clock className="w-3.5 h-3.5" /> Patient Entered
                            </span>
                          )}
                        </div>
                      </div>

                      {!item.isVerifiedByClinician && (
                        <button
                          onClick={() => handleDeleteItem('medications', item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-center"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                    <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Listed Medications</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No active prescription or over-the-counter medications listed.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MEDICAL HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {healthProfile?.medicalHistory && healthProfile.medicalHistory.length > 0 ? (
                  healthProfile.medicalHistory.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full uppercase">
                            {item.category}
                          </span>
                        </div>
                        {item.eventDate && <p className="text-xs text-slate-500">Date: {item.eventDate}</p>}
                        {item.description && <p className="text-xs text-slate-600">{item.description}</p>}
                        <div className="pt-2 flex items-center gap-2">
                          {item.isVerifiedByClinician ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Clinician Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                              <Clock className="w-3.5 h-3.5" /> Patient Entered
                            </span>
                          )}
                        </div>
                      </div>

                      {!item.isVerifiedByClinician && (
                        <button
                          onClick={() => handleDeleteItem('history', item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors self-start sm:self-center"
                          title="Delete Record"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No Past Medical History Entries</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No surgeries, hospitalizations, or family history logged.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Dialog for Adding Health Info */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Add {activeTab === 'allergies' ? 'Allergy' : activeTab === 'conditions' ? 'Medical Condition' : activeTab === 'medications' ? 'Medication' : 'Medical History'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeTab === 'allergies' && (
                <form onSubmit={handleAddAllergy} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Allergen Name *</label>
                    <input
                      type="text"
                      required
                      value={allergyForm.allergen}
                      onChange={(e) => setAllergyForm({ ...allergyForm, allergen: e.target.value })}
                      placeholder="e.g. Penicillin, Peanuts, Latex"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Severity Level</label>
                    <select
                      value={allergyForm.severity}
                      onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="MILD">Mild</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="SEVERE">Severe</option>
                      <option value="LIFE_THREATENING">Life Threatening</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Reaction Symptoms</label>
                    <input
                      type="text"
                      value={allergyForm.reaction}
                      onChange={(e) => setAllergyForm({ ...allergyForm, reaction: e.target.value })}
                      placeholder="e.g. Hives, Rash, Anaphylaxis"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="pt-3 flex justify-end gap-3">
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
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg"
                    >
                      {submitting ? 'Saving...' : 'Add Allergy Entry'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'conditions' && (
                <form onSubmit={handleAddCondition} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Name *</label>
                    <input
                      type="text"
                      required
                      value={conditionForm.conditionName}
                      onChange={(e) => setConditionForm({ ...conditionForm, conditionName: e.target.value })}
                      placeholder="e.g. Hypertension, Asthma"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosed Date</label>
                    <input
                      type="date"
                      value={conditionForm.diagnosedDate}
                      onChange={(e) => setConditionForm({ ...conditionForm, diagnosedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={conditionForm.status}
                      onChange={(e) => setConditionForm({ ...conditionForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CHRONIC">Chronic</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                  <div className="pt-3 flex justify-end gap-3">
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
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg"
                    >
                      {submitting ? 'Saving...' : 'Add Condition Entry'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'medications' && (
                <form onSubmit={handleAddMedication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name *</label>
                    <input
                      type="text"
                      required
                      value={medicationForm.medicationName}
                      onChange={(e) => setMedicationForm({ ...medicationForm, medicationName: e.target.value })}
                      placeholder="e.g. Paracetamol 500mg"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm({ ...medicationForm, dosage: e.target.value })}
                        placeholder="e.g. 1 Tablet"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medicationForm.frequency}
                        onChange={(e) => setMedicationForm({ ...medicationForm, frequency: e.target.value })}
                        placeholder="e.g. Twice Daily"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div className="pt-3 flex justify-end gap-3">
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
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg"
                    >
                      {submitting ? 'Saving...' : 'Add Medication Entry'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'history' && (
                <form onSubmit={handleAddHistory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Title *</label>
                    <input
                      type="text"
                      required
                      value={historyForm.title}
                      onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })}
                      placeholder="e.g. Appendectomy Surgery"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={historyForm.category}
                      onChange={(e) => setHistoryForm({ ...historyForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="GENERAL">General Medical</option>
                      <option value="SURGERY">Surgery / Procedure</option>
                      <option value="HOSPITALIZATION">Hospitalization</option>
                      <option value="IMMUNIZATION">Immunization / Vaccine</option>
                      <option value="FAMILY_HISTORY">Family Medical History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
                    <textarea
                      value={historyForm.description}
                      onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="pt-3 flex justify-end gap-3">
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
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg"
                    >
                      {submitting ? 'Saving...' : 'Add History Entry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
