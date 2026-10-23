'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import {
  Building2,
  Users,
  UserPlus,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  UserCheck,
  Trash2,
  Activity,
  FileText,
  Clock,
  RefreshCw,
  Edit2,
  Save,
} from 'lucide-react';

export default function OrganizationAdminPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'invitations' | 'reports' | 'audit'>('settings');

  // Org & Context Data
  const [org, setOrg] = useState<any>(null);
  const [orgId, setOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [orgName, setOrgName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [state, setState] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Members State
  const [members, setMembers] = useState<any[]>([]);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // Invitations State
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'FACILITY_STAFF' | 'FACILITY_ADMIN'>('FACILITY_STAFF');
  const [inviting, setInviting] = useState(false);

  // Reports State
  const [reports, setReports] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    fetchActiveOrganization();
  }, []);

  useEffect(() => {
    if (!orgId) return;
    if (activeTab === 'members') fetchMembers();
    if (activeTab === 'invitations') fetchInvitations();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, orgId]);

  const fetchActiveOrganization = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/me`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        const activeOrg = json.data.activeOrganization || json.data.memberships?.[0]?.organization;
        if (activeOrg) {
          setOrgId(activeOrg.id);
          fetchOrgDetails(activeOrg.id);
        } else {
          setError('No active organization found for your staff account.');
          setLoading(false);
        }
      } else {
        setError('Failed to resolve active staff account session.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error while loading user context.');
      setLoading(false);
    }
  };

  const fetchOrgDetails = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${id}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) {
        setOrg(json.data);
        setOrgName(json.data.name || '');
        setRcNumber(json.data.rcNumber || '');
        setState(json.data.state || '');
      } else {
        setError(json.error?.message || 'Failed to load organization details.');
      }
    } catch (err) {
      setError('Error connecting to API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: orgName, rcNumber, state }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Organization settings updated successfully.');
        fetchOrgDetails(orgId);
      } else {
        setError(json.error?.message || 'Failed to update organization settings.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/members`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setMembers(json.data || []);
    } catch (err) {
      // Ignore
    }
  };

  const handleUpdateMember = async (memberId: string, role?: string, isActive?: boolean) => {
    setUpdatingMemberId(memberId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Member updated successfully.');
        fetchMembers();
      } else {
        setError(json.error?.message || 'Failed to update member.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this staff member from the organization?')) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Member removed successfully.');
        fetchMembers();
      } else {
        setError(json.error?.message || 'Failed to remove member.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/invitations`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setInvitations(json.data || []);
    } catch (err) {
      // Ignore
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        fetchInvitations();
      } else {
        setError(json.error?.message || 'Failed to send invitation.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/invitations/${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Invitation revoked.');
        fetchInvitations();
      } else {
        setError(json.error?.message || 'Failed to revoke invitation.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/reports/summary`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setReports(json.data);
    } catch (err) {
      // Ignore
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/audit-logs`, { credentials: 'include' });
      const json = await res.json();
      if (json.success) setAuditLogs(json.data || []);
    } catch (err) {
      // Ignore
    } finally {
      setLoadingAudit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 pt-28 pb-16 px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent mt-12"></div>
          <p className="mt-3 text-slate-600 text-sm font-medium">Loading organization administrative portal...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
        {/* Header Title Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {org?.name || 'Healthcare Organization'} Administration
              </h1>
              <p className="text-slate-500 text-xs mt-0.5">
                Manage tenant settings, staff memberships, invitation onboarding, and operational activity reports.
              </p>
            </div>
          </div>
          {org?.rcNumber && (
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              CAC RC: {org.rcNumber}
            </span>
          )}
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

        {/* Admin Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 mb-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" /> Organization Settings
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Memberships & Roles
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'invitations'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Staff Onboarding
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Operational Reports
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Audit History
          </button>
        </div>

        {/* Tab 1: Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-teal-700" /> Organization Details
            </h3>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization Legal Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CAC RC Registration Number</label>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="e.g. RC-1234567"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {savingSettings ? 'Saving...' : 'Save Organization Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Memberships & Roles */}
        {activeTab === 'members' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Organization Members</h3>
              <span className="text-slate-500">{members.length} registered staff</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{m.user?.fullName}</p>
                        <p className="text-[10px] text-slate-500">{m.user?.email}</p>
                      </td>
                      <td className="p-3">
                        <select
                          value={m.role}
                          onChange={(e) => handleUpdateMember(m.id, e.target.value, m.isActive)}
                          disabled={updatingMemberId === m.id}
                          className="p-1.5 border border-slate-300 rounded text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="FACILITY_STAFF">FACILITY_STAFF</option>
                          <option value="FACILITY_ADMIN">FACILITY_ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {m.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateMember(m.id, m.role, !m.isActive)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                        >
                          {m.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Staff Onboarding / Invitations */}
        {activeTab === 'invitations' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-700" /> Send Staff Invitation
              </h3>
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="doctor@clinic.com"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="FACILITY_STAFF">Facility Staff / Clinician</option>
                    <option value="FACILITY_ADMIN">Facility Administrator</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
                >
                  {inviting ? 'Sending...' : 'Send Invitation Token'}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
                Pending Staff Invitations
              </div>
              {invitations.length === 0 ? (
                <p className="p-8 text-center text-slate-500">No pending staff invitations.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{inv.email}</p>
                        <p className="text-[10px] text-slate-500">
                          Role: <span className="font-semibold">{inv.role}</span> | Expires:{' '}
                          {new Date(inv.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Operational Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6 text-xs">
            {loadingReports ? (
              <p className="p-8 text-center text-slate-500">Loading operational activity reports...</p>
            ) : reports ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Total Appointments</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{reports.appointments?.total || 0}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <p>Confirmed: {reports.appointments?.byStatus?.completed || 0}</p>
                    <p>Scheduled: {reports.appointments?.byStatus?.scheduled || 0}</p>
                    <p>Cancelled: {reports.appointments?.byStatus?.cancelled || 0}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Registered Patients</p>
                  <p className="text-2xl font-extrabold text-teal-700 mt-1">{reports.patients?.total || 0}</p>
                  <p className="text-[11px] text-slate-500 mt-3">Linked to organization directory</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Staff Memberships</p>
                  <p className="text-2xl font-extrabold text-purple-700 mt-1">{reports.memberships?.total || 0}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <p>Active: {reports.memberships?.active || 0}</p>
                    <p>Inactive: {reports.memberships?.inactive || 0}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Clinical Encounters</p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">{reports.clinicalActivity?.totalEncounters || 0}</p>
                  <p className="text-[11px] text-slate-500 mt-3">Total recorded encounters</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Failed to load reports summary.</p>
            )}
          </div>
        )}

        {/* Tab 5: Audit History */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 text-sm">
              Administrative Audit Log Trail
            </div>
            {loadingAudit ? (
              <p className="p-8 text-center text-slate-500">Loading audit history...</p>
            ) : auditLogs.length === 0 ? (
              <p className="p-8 text-center text-slate-500">No audit logs recorded for this organization.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500 font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-bold text-slate-900">{log.action}</td>
                        <td className="p-3 text-slate-700">{log.user?.fullName || log.userId || 'System'}</td>
                        <td className="p-3 text-slate-600">
                          {log.entity} ({log.entityId || 'N/A'})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
