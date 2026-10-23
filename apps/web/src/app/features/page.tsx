import React from 'react';
import { CalendarCheck2, Users2, ShieldAlert, CreditCard, BellRing, ClipboardList } from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      icon: CalendarCheck2,
      title: 'Appointment Scheduling & Queueing',
      description: 'Conflict-free appointment booking for patients and hospital desks with real-time status tracking (Scheduled, In-Progress, Completed, Cancelled).'
    },
    {
      icon: Users2,
      title: 'Facility & Staff Administration',
      description: 'Manage clinical rosters, departments, and medical personnel across multiple facility branches under a unified organization tenant.'
    },
    {
      icon: ClipboardList,
      title: 'Patient Profile & Vault',
      description: 'Secure patient registration containing essential demographic and medical metadata (genotype, blood group, emergency contact).'
    },
    {
      icon: CreditCard,
      title: 'SaaS Subscription Tiering',
      description: 'Flexible plan tiers (Starter, Professional, Enterprise) structured for private practices up to multi-location healthcare networks.'
    },
    {
      icon: BellRing,
      title: 'Notifications & Dispatch',
      description: 'Automated notification logging for email and SMS booking confirmations and appointment reminders.'
    },
    {
      icon: ShieldAlert,
      title: 'Immutable Audit Trail',
      description: 'Comprehensive audit logging of user activity, administrative edits, and record access to maintain strict security compliance.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <div className="max-w-3xl mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary font-semibold text-xs mb-4">
          <span>Platform Capabilities</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-on-surface mb-6 tracking-tight">
          Comprehensive Features & Services
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          MediTrack delivers the foundational software infrastructure required to manage healthcare operations reliably, securely, and efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="p-8 bg-surface-lowest rounded-2xl border border-outline-variant/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
