import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function CookiesPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="October 2023">
      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">1. Use of Cookies</h2>
      <p className="text-on-surface-variant">
        MediTrack uses essential cookies and local session state necessary to deliver secure user authentication, maintain active sessions, and prevent cross-site request forgery.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">2. Cookie Categories</h2>
      <p className="text-on-surface-variant">
        We strictly utilize essential security and operational cookies. We do not use third-party advertising tracking cookies or persistent profiling tools.
      </p>
    </LegalLayout>
  );
}
