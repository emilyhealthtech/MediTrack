'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, CheckCircle, AlertCircle, ArrowRight, Layers } from 'lucide-react';

export default function SelectContextPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/me/memberships`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setMemberships(data.data);
          setSelectedOrgId(data.data[0].organizationId);
          if (data.data[0].organization?.facilities?.length > 0) {
            setSelectedFacilityId(data.data[0].organization.facilities[0].id);
          }
        } else {
          setErrorMsg('No active organization memberships found for your user account.');
        }
      })
      .catch(() => setErrorMsg('Failed to load user memberships. Ensure you are signed in.'))
      .finally(() => setLoading(false));
  }, []);

  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId);
    const target = memberships.find((m) => m.organizationId === orgId);
    if (target?.organization?.facilities?.length > 0) {
      setSelectedFacilityId(target.organization.facilities[0].id);
    } else {
      setSelectedFacilityId('');
    }
  };

  const handleSwitchContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/me/active-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          facilityId: selectedFacilityId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to switch active context.');
      }

      router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating active organization context.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeMembership = memberships.find((m) => m.organizationId === selectedOrgId);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12">
      <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Organization & Facility Selector</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Switch your active tenant context for administrative and clinical operations.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-xs text-on-surface-variant animate-pulse py-6">
            Loading your organization memberships...
          </p>
        ) : memberships.length > 0 ? (
          <form onSubmit={handleSwitchContext} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">Select Organization Context</label>
              <select
                value={selectedOrgId}
                onChange={(e) => handleOrgChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {memberships.map((m) => (
                  <option key={m.organizationId} value={m.organizationId}>
                    {m.organization?.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {activeMembership?.organization?.facilities?.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface">Select Facility Branch</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-outline-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {activeMembership.organization.facilities.map((fac: any) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.city}, {fac.state})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedOrgId}
              className="w-full py-3 bg-primary text-on-primary font-semibold text-sm rounded-lg shadow-sm hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? 'Switching Context...' : 'Switch Active Context'}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
