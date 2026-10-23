import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-lowest border-t border-outline-variant/40 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand & Nigerian NDPA Compliance Notice */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg">
                M
              </div>
              <span className="font-semibold text-xl text-primary">MediTrack</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed max-w-sm">
              Healthcare appointment scheduling & administrative SaaS for Nigerian clinics, hospitals, and diagnostic centers.
            </p>
            <div className="bg-surface-low p-4 rounded-xl border border-outline-variant/60">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>NDPA 2023 Notice & Legal Status</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-normal">
                Draft Content Pending Legal Review under Nigerian Data Protection Act 2023. Fictional seed data used during demonstration.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/features" className="hover:text-primary transition-colors">Features & Services</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/consent" className="hover:text-primary transition-colors">Consent & Data Use</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div>
            <h4 className="font-semibold text-sm text-on-surface mb-4">Support & Contact</h4>
            <p className="text-sm text-on-surface-variant mb-2">Lagos & Abuja, Nigeria</p>
            <p className="text-sm text-on-surface-variant mb-4">support@meditrack.ng</p>
            <div className="inline-flex items-center gap-2 text-xs text-primary font-medium bg-primary-light/50 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Phase 1 System Online</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <p>© {new Date().getFullYear()} MediTrack Technologies Nigeria. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Designed in alignment with Nigerian Healthcare Administrative Requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}
