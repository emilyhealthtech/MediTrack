import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="October 2023">
      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">1. Acceptance of Terms</h2>
      <p className="text-on-surface-variant">
        By accessing or using the MediTrack healthcare appointment and administrative platform, healthcare facilities, staff members, and patients agree to be bound by these Terms of Service. If you do not agree, do not access the platform.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">2. Scope of Service & Non-Clinical Limitation</h2>
      <p className="text-on-surface-variant">
        MediTrack provides administrative software for scheduling appointments, facility administration, and basic profile handling. MediTrack does not provide clinical diagnosis, medical advice, autonomous treatment recommendations, or electronic prescribing.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">3. Facility & Multi-Tenant Responsibilities</h2>
      <p className="text-on-surface-variant">
        Participating healthcare organizations are responsible for ensuring that all staff users maintain confidentiality, enforce access control, and comply with applicable Nigerian healthcare laws.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">4. Account Security</h2>
      <p className="text-on-surface-variant">
        Users are responsible for safeguarding login credentials. Any unauthorized access resulting from compromised credentials must be reported immediately to security@meditrack.ng.
      </p>
    </LegalLayout>
  );
}
