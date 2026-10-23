import React from 'react';

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
      <div className="mb-10 pb-6 border-b border-outline-variant/40">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-container/60 text-error font-semibold text-xs mb-4">
          <span>Draft Document — Pending Legal & Regulatory Review</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-on-surface mb-2">{title}</h1>
        <p className="text-xs text-on-surface-variant">Last Updated: {lastUpdated} | Governed by Nigerian Law Framework</p>
      </div>

      <div className="bg-surface-low p-6 rounded-2xl border border-outline-variant/60 mb-8 text-xs text-on-surface-variant leading-relaxed">
        <strong>Notice:</strong> This legal agreement is a draft template provided for evaluation purposes within the MediTrack Phase 1 platform framework. It does not constitute binding legal advice and must be formally reviewed and finalized by qualified Nigerian legal and privacy professionals prior to commercial deployment.
      </div>

      <div className="prose max-w-none text-on-surface space-y-6 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
