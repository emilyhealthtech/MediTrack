import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="October 2023">
      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">1. NDPA 2023 Privacy Principles</h2>
      <p className="text-on-surface-variant">
        MediTrack collects and processes personal data strictly in accordance with the Nigerian Data Protection Act (NDPA 2023). Personal data is processed lawfully, fairly, and transparently for specified healthcare administrative purposes.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">2. Data We Collect</h2>
      <p className="text-on-surface-variant">
        We collect user account information (name, email, phone number, role), patient profile metadata required for appointment booking (date of birth, gender, blood group, genotype, emergency contact), and audit event logs.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">3. How Data Is Used & Data Isolation</h2>
      <p className="text-on-surface-variant">
        Patient data is partitioned by healthcare organization tenants. Data is used solely for facilitating appointment bookings, notifications, and administrative logs. Data is never sold or shared for marketing.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">4. Data Subjects Rights</h2>
      <p className="text-on-surface-variant">
        Under NDPA 2023, data subjects have rights to request access, correction, erasure, or restriction of processing of their personal data by contacting dpo@meditrack.ng.
      </p>
    </LegalLayout>
  );
}
