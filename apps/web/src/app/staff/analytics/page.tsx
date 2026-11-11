'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { AnalyticsDashboardDTO } from '@meditrack/shared';
import {
  BarChart3,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
  UserCheck,
  TrendingUp,
  Download,
  RefreshCw,
  Filter,
  Search,
  Building2,
  PieChart as PieIcon,
  Activity,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Stethoscope,
  FileSpreadsheet,
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboardDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string>('');

  // Filters State
  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | '90d' | 'year' | 'custom'>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [providerSearch, setProviderSearch] = useState('');

  // Chart interactivity states
  const [activeTrendType, setActiveTrendType] = useState<'total' | 'completed' | 'cancelled' | 'missed'>('total');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    calculateDateWindow('30d');
    fetchOrganizationContext();
  }, []);

  const calculateDateWindow = (preset: '7d' | '30d' | '90d' | 'year') => {
    const end = new Date();
    const start = new Date();
    if (preset === '7d') {
      start.setDate(end.getDate() - 7);
      setGranularity('daily');
    } else if (preset === '30d') {
      start.setDate(end.getDate() - 30);
      setGranularity('daily');
    } else if (preset === '90d') {
      start.setDate(end.getDate() - 90);
      setGranularity('weekly');
    } else if (preset === 'year') {
      start.setFullYear(end.getFullYear() - 1);
      setGranularity('monthly');
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const fetchOrganizationContext = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/me`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data) {
        const activeOrg = json.data.activeOrganization || json.data.memberships?.[0]?.organization;
        if (activeOrg) {
          setOrgId(activeOrg.id);
          fetchFacilities(activeOrg.id);
        } else {
          setError('No active healthcare organization found for your staff account.');
          setLoading(false);
        }
      } else {
        setError('Failed to authenticate organization staff context.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network connection error while resolving session context.');
      setLoading(false);
    }
  };

  const fetchFacilities = async (targetOrgId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${targetOrgId}`, { credentials: 'include' });
      const json = await res.json();
      if (json.success && json.data?.facilities) {
        setFacilities(json.data.facilities);
      }
    } catch {
      // Ignore facilities fetch failure
    }
  };

  const fetchAnalytics = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', new Date(startDate).toISOString());
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.set('endDate', endDateTime.toISOString());
      }
      params.set('granularity', granularity);
      if (facilityFilter) params.set('facilityId', facilityFilter);
      if (selectedDepartment) params.set('department', selectedDepartment);

      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/analytics?${params.toString()}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to load organization analytics.');
      }
    } catch (err) {
      setError('Failed to connect to analytics server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchAnalytics();
    }
  }, [orgId, startDate, endDate, granularity, facilityFilter, selectedDepartment]);

  const handlePresetChange = (preset: '7d' | '30d' | '90d' | 'year' | 'custom') => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      calculateDateWindow(preset);
    }
  };

  const handleExportCsv = async (reportType: 'overview' | 'appointments' | 'departments' | 'providers' | 'patients') => {
    if (!orgId) return;
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', new Date(startDate).toISOString());
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.set('endDate', endDateTime.toISOString());
      }
      if (facilityFilter) params.set('facilityId', facilityFilter);
      if (selectedDepartment) params.set('department', selectedDepartment);
      params.set('reportType', reportType);

      const res = await fetch(`${API_BASE_URL}/api/v1/organizations/${orgId}/analytics/export?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to download CSV');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meditrack-report-${reportType}-${startDate || 'all'}-to-${endDate || 'now'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Error exporting CSV report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Filter provider activity
  const filteredProviders = (data?.providerActivity || []).filter((p) => {
    if (!providerSearch) return true;
    const q = providerSearch.toLowerCase();
    return p.providerName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full">
        {/* Top Header & Context Banner */}
        <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Healthcare Data & Analytics
                </h1>
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[11px] font-bold rounded-full">
                  LIVE METRICS
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Real-time operational reporting, demographics, and provider performance for{' '}
                <span className="font-semibold text-slate-800">{data?.organizationName || 'your organization'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Refresh analytics data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Dropdown Group */}
            <div className="relative inline-block text-left group">
              <button
                disabled={exporting || loading}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                {exporting ? 'Exporting...' : 'Export CSV Reports'}
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1 hidden group-hover:block z-20">
                <button
                  onClick={() => handleExportCsv('overview')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" /> Executive Overview
                </button>
                <button
                  onClick={() => handleExportCsv('appointments')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" /> Appointment Trends
                </button>
                <button
                  onClick={() => handleExportCsv('departments')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Department Performance
                </button>
                <button
                  onClick={() => handleExportCsv('providers')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" /> Provider Activity
                </button>
                <button
                  onClick={() => handleExportCsv('patients')}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5 text-teal-600" /> Patient Demographics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Range Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Presets */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {(['7d', '30d', '90d', 'year', 'custom'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    dateRangePreset === preset
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset === '7d' && 'Last 7 Days'}
                  {preset === '30d' && 'Last 30 Days'}
                  {preset === '90d' && 'Last 90 Days'}
                  {preset === 'year' && 'Past 12 Months'}
                  {preset === 'custom' && 'Custom Range'}
                </button>
              ))}
            </div>

            {/* Granularity */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Granularity:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-semibold ${
                      granularity === g ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            {dateRangePreset === 'custom' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facility Campus</label>
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="">All Organization Facilities</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department Filter</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="">All Departments</option>
                {(data?.departmentPerformance || []).map((d) => (
                  <option key={d.department} value={d.department}>
                    {d.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                  <div className="h-3 w-20 bg-slate-200 rounded mb-3"></div>
                  <div className="h-7 w-12 bg-slate-300 rounded mb-2"></div>
                  <div className="h-2 w-28 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
            <div className="h-72 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && data && data.summaryStats.totalAppointments === 0 && data.summaryStats.totalRegisteredPatients === 0 && (
          <div className="p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl mb-8">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Analytics Data in Selected Range</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              There are no appointments or patient registrations recorded for this date window. Try selecting a broader
              range or resetting filters.
            </p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* 1. STATISTICAL CARDS OVERVIEW (8 key metrics) */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* 1. Total registered patients */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Total Patients</span>
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {data.summaryStats.totalRegisteredPatients}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">All-time registered in org</p>
                </div>

                {/* 2. New patients */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>New Patients</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">
                    {data.summaryStats.newPatients}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Registered in selected period</p>
                </div>

                {/* 3. Total appointments */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Total Consultations</span>
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {data.summaryStats.totalAppointments}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Total bookings in period</p>
                </div>

                {/* 4. Completed appointments */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Completed</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                    {data.summaryStats.completedAppointments}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {data.visitStatistics.overallCompletionRate}% completion rate
                  </p>
                </div>

                {/* 5. Pending appointments */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Pending / Scheduled</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                    {data.summaryStats.pendingAppointments}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Scheduled or in-progress</p>
                </div>

                {/* 6. Cancelled appointments */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Cancelled</span>
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
                    {data.summaryStats.cancelledAppointments}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {data.visitStatistics.overallCancellationRate}% cancellation rate
                  </p>
                </div>

                {/* 7. Missed appointments */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Missed (No-Show)</span>
                    <AlertOctagon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">
                    {data.summaryStats.missedAppointments}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {data.visitStatistics.overallNoShowRate}% no-show rate
                  </p>
                </div>

                {/* 8. Active healthcare providers */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-colors">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                    <span>Active Clinicians</span>
                    <UserCheck className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {data.summaryStats.activeHealthcareProviders}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Authorized facility staff</p>
                </div>
              </div>
            </section>

            {/* 2. TIME-SERIES TRENDS (Appointment Trends & Patient Registration Trends) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Appointment Trends Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-700" />
                      Appointment Trends by {granularity}
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Visualizing consultation volume over time with interactive status breakdown
                    </p>
                  </div>

                  {/* Trend Filter Toggles */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setActiveTrendType('total')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        activeTrendType === 'total' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      All ({data.summaryStats.totalAppointments})
                    </button>
                    <button
                      onClick={() => setActiveTrendType('completed')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        activeTrendType === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setActiveTrendType('cancelled')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        activeTrendType === 'cancelled' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      Cancelled
                    </button>
                    <button
                      onClick={() => setActiveTrendType('missed')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        activeTrendType === 'missed' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      No-Show
                    </button>
                  </div>
                </div>

                {/* Interactive SVG Line / Bar Chart */}
                {(() => {
                  const points = data.appointmentTrends[activeTrendType] || [];
                  const maxVal = Math.max(...points.map((p) => p.count), 5);
                  const strokeColor =
                    activeTrendType === 'completed'
                      ? '#059669'
                      : activeTrendType === 'cancelled'
                      ? '#e11d48'
                      : activeTrendType === 'missed'
                      ? '#7c3aed'
                      : '#0e7490';

                  return (
                    <div>
                      {points.length === 0 ? (
                        <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
                          No trend points in date range.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="h-64 relative flex items-end gap-1.5 pt-8 pb-4 px-2 border-b border-slate-100">
                            {points.map((pt, idx) => {
                              const heightPct = Math.round((pt.count / maxVal) * 100);
                              return (
                                <div
                                  key={pt.date || idx}
                                  className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                                >
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                    <p className="font-bold">{pt.label}</p>
                                    <p>{pt.count} appointments</p>
                                  </div>

                                  {/* Column Bar */}
                                  <div
                                    style={{
                                      height: `${Math.max(heightPct, 6)}%`,
                                      backgroundColor: strokeColor,
                                    }}
                                    className="w-full rounded-t-md opacity-80 group-hover:opacity-100 transition-all hover:scale-105"
                                  ></div>
                                </div>
                              );
                            })}
                          </div>

                          {/* X-Axis labels preview */}
                          <div className="flex justify-between text-[10px] text-slate-400 px-1 font-mono">
                            <span>{points[0]?.label || ''}</span>
                            {points.length > 2 && (
                              <span>{points[Math.floor(points.length / 2)]?.label || ''}</span>
                            )}
                            <span>{points[points.length - 1]?.label || ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Patient Registration Trends */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-700" />
                      Registration Trends
                    </h3>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                      +{data.summaryStats.newPatients} New
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-6">Patient onboarding volume across active timeframe</p>

                  <div className="space-y-3">
                    {(data.patientRegistrationTrends || []).slice(-6).map((item) => (
                      <div key={item.date} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">{item.label}</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[120px] mx-3">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-600 rounded-full"
                              style={{
                                width: `${Math.min(
                                  Math.round(
                                    (item.count /
                                      Math.max(
                                        ...data.patientRegistrationTrends.map((t) => t.count),
                                        1
                                      )) *
                                      100
                                  ),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 min-w-[20px] text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Total Linked Directory</span>
                  <span className="font-extrabold text-slate-900 text-sm">{data.summaryStats.totalRegisteredPatients} Patients</span>
                </div>
              </div>
            </section>

            {/* 3. DEMOGRAPHICS (Gender & Age Distribution) */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender Distribution Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-teal-700" /> Patient Gender Distribution
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">Categorized biological sex of registered patients</p>
                  </div>
                </div>

                {(() => {
                  const g = data.patientDemographics.gender;
                  const total = g.male + g.female + g.other + g.unspecified || 1;
                  const malePct = Math.round((g.male / total) * 100);
                  const femalePct = Math.round((g.female / total) * 100);
                  const otherPct = Math.round((g.other / total) * 100);
                  const unspPct = Math.round((g.unspecified / total) * 100);

                  return (
                    <div className="space-y-5">
                      {/* Segmented bar */}
                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        <div style={{ width: `${malePct}%` }} className="bg-sky-600 transition-all" title={`Male: ${malePct}%`}></div>
                        <div style={{ width: `${femalePct}%` }} className="bg-teal-500 transition-all" title={`Female: ${femalePct}%`}></div>
                        <div style={{ width: `${otherPct}%` }} className="bg-amber-400 transition-all" title={`Other: ${otherPct}%`}></div>
                        <div style={{ width: `${unspPct}%` }} className="bg-slate-300 transition-all" title={`Unspecified: ${unspPct}%`}></div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                          <p className="text-sky-800 font-semibold text-[11px]">Male</p>
                          <p className="text-lg font-bold text-sky-950 mt-1">{g.male}</p>
                          <p className="text-[10px] text-sky-700">{malePct}%</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                          <p className="text-teal-800 font-semibold text-[11px]">Female</p>
                          <p className="text-lg font-bold text-teal-950 mt-1">{g.female}</p>
                          <p className="text-[10px] text-teal-700">{femalePct}%</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-amber-800 font-semibold text-[11px]">Other</p>
                          <p className="text-lg font-bold text-amber-950 mt-1">{g.other}</p>
                          <p className="text-[10px] text-amber-700">{otherPct}%</p>
                        </div>
                        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                          <p className="text-slate-700 font-semibold text-[11px]">Unspecified</p>
                          <p className="text-lg font-bold text-slate-900 mt-1">{g.unspecified}</p>
                          <p className="text-[10px] text-slate-600">{unspPct}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Age Distribution Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-700" /> Patient Age Distribution
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">Demographic breakdown across age cohorts</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.patientDemographics.ageGroups.map((grp) => (
                    <div key={grp.group} className="flex items-center justify-between text-xs">
                      <span className="w-20 font-semibold text-slate-700">{grp.group} yrs</span>
                      <div className="flex-1 mx-3 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-700 rounded-full"
                          style={{ width: `${Math.max(grp.percentage, 2)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900 w-12 text-right">
                        {grp.count} <span className="font-normal text-[10px] text-slate-500">({grp.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. DEPARTMENT PERFORMANCE & REQUESTED SERVICES */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Department Performance Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-700" /> Department Performance
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Consultation activity, completed sessions, and completion efficiency per specialty
                    </p>
                  </div>
                </div>

                {data.departmentPerformance.length === 0 ? (
                  <p className="p-8 text-center text-slate-400">No department bookings in selected window.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                          <th className="p-3.5">Specialty / Department</th>
                          <th className="p-3.5 text-center">Total Bookings</th>
                          <th className="p-3.5 text-center">Completed</th>
                          <th className="p-3.5 text-center">Cancelled</th>
                          <th className="p-3.5 text-right">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.departmentPerformance.map((dept) => (
                          <tr key={dept.department} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900">{dept.department}</td>
                            <td className="p-3.5 text-center font-semibold text-slate-800">{dept.totalAppointments}</td>
                            <td className="p-3.5 text-center text-emerald-700 font-semibold">{dept.completedAppointments}</td>
                            <td className="p-3.5 text-center text-rose-600 font-semibold">{dept.cancelledAppointments}</td>
                            <td className="p-3.5 text-right">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  dept.completionRate >= 70
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : dept.completionRate >= 40
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {dept.completionRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Most Requested Healthcare Services & Modes */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-teal-700" /> Requested Services
                  </h3>
                  <p className="text-slate-500 text-xs mb-4">Patient demand across clinical modes and departments</p>

                  <div className="space-y-3">
                    {data.mostRequestedServices.slice(0, 6).map((srv) => (
                      <div key={srv.service} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                          <span className="truncate pr-2">{srv.service}</span>
                          <span className="text-teal-700 font-bold">{srv.count}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-700 h-full rounded-full"
                            style={{ width: `${Math.min(srv.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-600 mb-2">Consultation Mode Distribution</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <p className="font-bold text-slate-900 text-xs">
                        {data.visitStatistics.modeDistribution.inPerson}
                      </p>
                      <p className="text-slate-500">In-Person</p>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <p className="font-bold text-slate-900 text-xs">
                        {data.visitStatistics.modeDistribution.virtual}
                      </p>
                      <p className="text-slate-500">Virtual</p>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <p className="font-bold text-slate-900 text-xs">
                        {data.visitStatistics.modeDistribution.telephone}
                      </p>
                      <p className="text-slate-500">Phone</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. HEALTHCARE PROVIDER ACTIVITY */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-700" /> Healthcare Provider Activity
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Consultation performance, completed sessions, and workload distribution across clinicians
                  </p>
                </div>

                {/* Clinician Search */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={(e) => setProviderSearch(e.target.value)}
                    placeholder="Search doctor by name or email..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {filteredProviders.length === 0 ? (
                <p className="p-8 text-center text-slate-400">No healthcare providers found matching search.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                        <th className="p-3.5">Healthcare Provider</th>
                        <th className="p-3.5 text-center">Total Assigned</th>
                        <th className="p-3.5 text-center">Completed Consultations</th>
                        <th className="p-3.5 text-center">Scheduled / Pending</th>
                        <th className="p-3.5 text-right">Completion Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProviders.map((prov) => (
                        <tr key={prov.providerId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{prov.providerName}</p>
                            <p className="text-[10px] text-slate-500">{prov.email}</p>
                          </td>
                          <td className="p-3.5 text-center font-semibold text-slate-800">{prov.totalAppointments}</td>
                          <td className="p-3.5 text-center font-semibold text-emerald-700">{prov.completedAppointments}</td>
                          <td className="p-3.5 text-center font-semibold text-blue-700">{prov.scheduledAppointments}</td>
                          <td className="p-3.5 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                prov.completionRate >= 70
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prov.completionRate >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {prov.completionRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
