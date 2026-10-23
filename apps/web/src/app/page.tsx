import React from 'react';
import Link from 'next/link';
import { Shield, ArrowRight, CheckCircle2, Calendar, Users, Building2, Lock, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-surface-lowest via-surface to-surface-low py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/40 text-on-surface font-medium text-xs mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>Tailored for Nigerian Healthcare Facilities</span>
              </div>
              <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight leading-tight mb-6">
                Your healthcare appointments, <span className="text-primary underline decoration-primary-light decoration-wavy">easier to manage.</span>
              </h1>
              <p className="text-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
                MediTrack is a secure multi-tenant SaaS platform built to streamline facility onboarding, appointment scheduling, patient registrations, and staff administrative workflows across Nigeria.
              </p>
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-container hover:bg-primary text-on-primary font-semibold text-base rounded-xl shadow-md transition-all"
                >
                  <span>Request Facility Access</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/features"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-surface-lowest border border-outline-variant hover:bg-surface-high text-on-surface font-semibold text-base rounded-xl transition-all"
                >
                  <span>Explore Features</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="bg-surface-lowest p-8 rounded-2xl shadow-xl border border-outline-variant/60 relative">
                <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-on-surface">Live Appointment Summary</span>
                  </div>
                  <span className="text-xs bg-primary-light text-primary font-medium px-2.5 py-1 rounded-full">Facility Status</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-surface-low rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-on-surface">Scheduled Appointments</p>
                      <p className="text-xs text-on-surface-variant">Lagos Central General Facility</p>
                    </div>
                    <span className="text-lg font-bold text-primary">142</span>
                  </div>
                  <div className="p-4 bg-surface-low rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-on-surface">Active Medical Staff</p>
                      <p className="text-xs text-on-surface-variant">Doctor & Nurse Roster</p>
                    </div>
                    <span className="text-lg font-bold text-secondary">28</span>
                  </div>
                  <div className="p-4 bg-surface-low rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-on-surface">Registered Patients</p>
                      <p className="text-xs text-on-surface-variant">Encrypted Profile Vault</p>
                    </div>
                    <span className="text-lg font-bold text-on-surface">1,840</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUE PROPOSITIONS */}
      <section className="py-16 bg-surface-lowest">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-on-surface mb-4">Built for Healthcare Reliability</h2>
            <p className="text-on-surface-variant">
              Designed specifically to meet the operational demands of private clinics, general hospitals, and diagnostic centers in Nigeria.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-surface-low rounded-2xl border border-outline-variant/60">
              <Building2 className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold text-on-surface mb-3">Multi-Tenant Isolation</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Strict tenant data separation ensures every hospital or clinic manages their facilities, staff, and patient records with isolated data boundaries.
              </p>
            </div>
            <div className="p-8 bg-surface-low rounded-2xl border border-outline-variant/60">
              <Calendar className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold text-on-surface mb-3">Conflict-Free Scheduling</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Automated schedule validation prevents double bookings across doctors, clinical departments, and specialized diagnostic equipment.
              </p>
            </div>
            <div className="p-8 bg-surface-low rounded-2xl border border-outline-variant/60">
              <Shield className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-bold text-on-surface mb-3">NDPA 2023 Readiness</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Privacy-first architecture with strict data minimization, audit logging, and explicit consent capture following Nigerian privacy rules.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
