import React from 'react';
import LegalLayout from '@/components/LegalLayout';

export default function ConsentPage() {
  return (
    <LegalLayout title="Consent & Data Use Information" lastUpdated="October 2023">
      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">1. Consent Mechanism</h2>
      <p className="text-on-surface-variant">
        Patient consent is required prior to processing appointment records or administrative profile information. Consent is captured explicitly through clear affirmative action.
      </p>

      <h2 className="text-xl font-bold text-on-surface mt-6 mb-3">2. Withdrawal of Consent</h2>
      <p className="text-on-surface-variant">
        Patients reserve the right to withdraw consent for administrative data processing at any time, subject to statutory healthcare record retention rules in Nigeria.
      </p>
    </LegalLayout>
  );
}
