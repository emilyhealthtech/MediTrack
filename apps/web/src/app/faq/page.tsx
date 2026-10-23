'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What healthcare facilities can use MediTrack?',
      a: 'MediTrack is designed for Nigerian private clinics, general hospitals, specialist centers, and diagnostic facilities. Its multi-tenant architecture supports single-location practices as well as multi-branch networks.'
    },
    {
      q: 'Does MediTrack replace medical doctors or clinical diagnosis?',
      a: 'No. MediTrack is strictly an administrative and appointment scheduling SaaS platform. It does not perform autonomous medical diagnosis, automated clinical decision-making, or electronic prescribing.'
    },
    {
      q: 'How does MediTrack ensure patient data privacy under Nigerian law?',
      a: 'MediTrack incorporates privacy-by-design principles adhering to the Nigerian Data Protection Act (NDPA 2023), including strict access controls, multi-tenant isolation, audit trails, and data minimization.'
    },
    {
      q: 'Can patients book appointments across multiple medical departments?',
      a: 'Yes. Patients can search for available appointment slots filtered by hospital department, facility location, or clinical service, preventing overlapping schedule conflicts.'
    },
    {
      q: 'How are subscription plans structured for healthcare organizations?',
      a: 'MediTrack offers Starter, Professional, and Enterprise subscription plans scaled by the number of active facilities, administrative staff seats, and patient appointment volume.'
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary font-semibold text-xs mb-4">
          <HelpCircle className="w-4 h-4" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="text-4xl font-bold text-on-surface mb-4">Got Questions? We Have Answers.</h1>
        <p className="text-on-surface-variant">Find clear answers regarding platform functionality, security, and onboarding.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-surface-lowest rounded-xl border border-outline-variant/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-6 text-left flex items-center justify-between font-semibold text-on-surface hover:text-primary transition-colors"
            >
              <span className="text-lg">{faq.q}</span>
              {openIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-on-surface-variant" />}
            </button>
            {openIndex === idx && (
              <div className="px-6 pb-6 text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/30 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
