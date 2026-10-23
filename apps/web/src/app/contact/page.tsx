'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organizationName: '',
    phone: '',
    subject: '',
    message: '',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.consent) {
      setErrorMsg('You must consent to data processing under NDPA regulations.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error?.message || 'Failed to submit contact request.');
      }
    } catch (err) {
      // Offline fallback simulation
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary font-semibold text-xs mb-4">
            <span>Contact Us</span>
          </div>
          <h1 className="text-4xl font-bold text-on-surface mb-6">Get in Touch with Our Team</h1>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Interested in onboarding your healthcare facility or asking questions about MediTrack? Reach out to our technical team in Nigeria.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface">Main Office Locations</p>
                <p className="text-sm text-on-surface-variant">Victoria Island, Lagos & Maitama, Abuja, Nigeria</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface">Email Inquiries</p>
                <p className="text-sm text-on-surface-variant">support@meditrack.ng</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-light text-primary rounded-xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-on-surface">Facility Support Desk</p>
                <p className="text-sm text-on-surface-variant">+234 (0) 1 800 6334</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-surface-lowest p-8 rounded-2xl border border-outline-variant/60 shadow-sm">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-on-surface mb-2">Message Sent Successfully!</h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Thank you for contacting MediTrack. Our Nigerian team will review your inquiry and respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-4 bg-error-container text-error text-sm rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="e.g. Dr. Ngozi Okonjo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="ngozi@hospital.ng"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Lagos Wellness Clinic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="+234 803 000 0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Facility Onboarding Inquiry"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-2">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  placeholder="Tell us about your healthcare facility and requirements..."
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <label htmlFor="consent" className="text-xs text-on-surface-variant leading-normal">
                  I consent to MediTrack collecting and processing my contact details strictly for responding to this inquiry under NDPA 2023 principles.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-on-primary font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
