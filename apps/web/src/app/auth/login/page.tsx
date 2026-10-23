'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('elena.rostova@example.com');
  const [password, setPassword] = useState('SecuredClinical#2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const handleQuickFill = () => {
    setEmail('elena.rostova@example.com');
    setPassword('SecuredClinical#2025!');
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  const handleDemoStateError = () => {
    setErrorMsg('Authentication failed. The email or password does not match clinical directory records. You have 3 remaining attempts before temporary security lockout.');
    setNoticeMsg(null);
  };

  const handleDemoStateNotice = () => {
    setErrorMsg(null);
    setNoticeMsg('Scheduled Telehealth Maintenance: Upgrades will take place Sunday from 02:00 to 04:00 WAT. Messaging remains online.');
  };

  const handleDemoStateDefault = () => {
    setErrorMsg(null);
    setNoticeMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed. Please check your credentials.');
      }

      if (data.data?.mfaRequired) {
        router.push(`/auth/mfa/challenge?mfaToken=${data.data.mfaToken}`);
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while signing in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 sm:p-10">
            <div className="mb-6 bg-surface-low rounded-lg p-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 px-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-medium text-on-surface-variant">Interactive View Mode:</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDemoStateDefault}
                  className="px-3 py-1 rounded text-xs font-medium bg-primary-container text-on-primary-container shadow-xs"
                >
                  Default
                </button>
                <button
                  type="button"
                  onClick={handleDemoStateError}
                  className="px-3 py-1 rounded text-xs font-medium text-on-surface-variant hover:bg-surface-container"
                >
                  Error State
                </button>
                <button
                  type="button"
                  onClick={handleDemoStateNotice}
                  className="px-3 py-1 rounded text-xs font-medium text-on-surface-variant hover:bg-surface-container"
                >
                  System Alert
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-lg bg-error-container text-on-error-container flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-bold">Authentication Error</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {noticeMsg && (
              <div className="mb-6 p-4 rounded-lg bg-surface-high text-on-surface flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-bold">System Notice</p>
                  <p className="text-on-surface-variant">{noticeMsg}</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container mb-3">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide">Secure Patient Portal Access</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Welcome back</h1>
              <p className="text-sm text-on-surface-variant">
                Sign in to manage your appointments, review clinical records, and connect with your healthcare provider.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-between p-3 rounded-lg bg-surface-low border border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold text-on-surface">Evaluation Preset:</span>
                <span className="font-mono text-on-surface-variant">Elena Rostova (#4912)</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-2.5 py-1 rounded bg-surface-lowest shadow-xs text-primary hover:bg-secondary-container text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                Quick-Fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface" htmlFor="email">
                  Email address <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant/40 bg-surface-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-on-surface" htmlFor="password">
                    Password <span className="text-error">*</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 rounded-lg border border-outline-variant/40 bg-surface-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <span className="text-xs text-on-surface-variant">Remember this device for 30 days</span>
                </label>
                <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span>256-bit Encrypted</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] py-3 px-6 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Clinical Portal</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-on-surface">New patient without an account?</p>
                <p className="text-xs text-on-surface-variant">Register now to search clinics and manage appointments.</p>
              </div>
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg bg-surface-low text-primary hover:bg-secondary-container text-xs font-semibold transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="bg-primary text-on-primary rounded-xl p-8 shadow-lg flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-on-primary/10 flex items-center justify-center text-primary-fixed">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Patient-Centred Care Portal</h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Connect with healthcare facilities across Nigeria, schedule appointments, and maintain your medical history safely.
              </p>
            </div>

            <div className="pt-6 border-t border-on-primary/10 text-xs space-y-2 opacity-80">
              <p className="font-semibold">Security & Privacy Assurance:</p>
              <p>• Secure HttpOnly session management</p>
              <p>• Mandatory MFA for facility & system administrators</p>
              <p>• NDPA 2023 privacy compliant data architecture</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
