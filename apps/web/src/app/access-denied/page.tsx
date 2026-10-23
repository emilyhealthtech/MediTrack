'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center mx-auto">
          <ShieldX className="w-6 h-6 text-error" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Access Denied</h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          You do not have the required permissions or organization membership to access this resource. Client-supplied organization IDs are validated strictly on the server.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-surface-low text-primary font-semibold text-xs rounded-lg hover:bg-secondary-container"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
