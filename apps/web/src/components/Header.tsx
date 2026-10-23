'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, User, Users } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Patient Dashboard', href: '/patient/dashboard' },
    { name: 'Health Profile', href: '/patient/health-profile' },
    { name: 'Staff Patient Directory', href: '/staff/patients' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-slate-900/95 backdrop-blur-md text-white shadow-md border-b border-slate-800">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <span className="font-semibold text-xl text-white tracking-tight">MediTrack</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-semibold transition-colors ${
                isActive(link.href)
                  ? 'text-teal-400 font-bold border-b-2 border-teal-400 pb-1'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/patient/dashboard"
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-teal-400" />
            Portal
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-teal-400"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 px-6 pt-4 pb-6 border-b border-slate-800 shadow-lg">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href) ? 'text-teal-400 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 border-t border-slate-800">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-lg"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
