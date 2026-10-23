'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function SessionExpiredPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/30 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-surface-low text-primary flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-on-surface">Session Expired</h1>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Your MediTrack session has expired due to inactivity to protect patient privacy and comply with healthcare data security standards.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-sm hover:bg-primary-hover"
        >
          <span>Sign In Again</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
