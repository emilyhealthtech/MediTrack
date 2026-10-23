import React from 'react';
import { Target, ShieldCheck, HeartPulse, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary font-semibold text-xs mb-4">
          <span>About MediTrack</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-on-surface mb-6 tracking-tight">
          Transforming Healthcare Operations Across Nigeria
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          MediTrack is designed to bridge the operational gap between healthcare providers and patients in Nigeria. By offering a digital-first SaaS platform for appointment scheduling and administrative health records, we enable facilities to reduce wait times and improve patient satisfaction.
        </p>
      </div>

      {/* Mission and Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-8 bg-surface-lowest rounded-2xl border border-outline-variant/60 shadow-sm">
          <Target className="w-10 h-10 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-3">Our Core Mission</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            To empower Nigerian hospitals, clinics, and diagnostic centers with intuitive, reliable digital tools that eliminate waiting room queues, optimize staff availability, and ensure seamless patient registration.
          </p>
        </div>

        <div className="p-8 bg-surface-lowest rounded-2xl border border-outline-variant/60 shadow-sm">
          <HeartPulse className="w-10 h-10 text-primary mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-3">Responsible AI & Scope</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            MediTrack provides administrative assistance only. We explicitly do not support autonomous medical diagnosis, clinical decision-making, or automated prescribing. Final clinical judgement remains strictly with licensed healthcare professionals.
          </p>
        </div>
      </div>

      {/* Legal & Regulatory Context */}
      <div className="p-8 bg-surface-low rounded-2xl border border-outline-variant/60">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-on-surface">Nigerian Data Protection Act (NDPA 2023) Notice</h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          All legal and privacy documentation presented on MediTrack is draft content pending formal legal review by qualified Nigerian privacy counsel. MediTrack does not claim official regulatory certification or compliance solely on the basis of technical security controls.
        </p>
        <p className="text-xs text-on-surface-variant italic">
          Note: This platform operates using fictional seed data for evaluation and testing purposes. No real patient personal health information (PHI) is processed or stored during this phase.
        </p>
      </div>
    </div>
  );
}
