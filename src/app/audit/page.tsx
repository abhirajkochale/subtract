'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuditResults } from '@/components/Results/AuditResults';
import type { AuditFormData } from '@/lib/types';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuditPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<AuditFormData | null>(null);

  useEffect(() => {
    // Read from session storage on client mount
    const savedPayload = sessionStorage.getItem('credex-audit-payload');
    if (savedPayload) {
      try {
        const parsed = JSON.parse(savedPayload) as AuditFormData;
        setFormData(parsed);
      } catch (err) {
        console.error('Failed to parse audit payload:', err);
      }
    }
    setIsMounted(true);
  }, []);

  // 1. Loading State (Hydration safe)
  if (!isMounted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
        <Loader2 size={32} className="animate-spin text-blue-600" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-slate-500">
          Running audit engine...
        </p>
      </div>
    );
  }

  // 2. Empty/Error State
  if (!formData || !formData.tools || formData.tools.length === 0) {
    return (
      <div className="mx-auto mt-20 flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-slate-50 p-3">
          <AlertCircle size={28} className="text-slate-400" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900">
          No Audit Data Found
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-500">
          It looks like you haven&apos;t entered your AI tool stack yet, or your session has expired. Start a free audit to see your potential savings.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Start Free Audit
        </Link>
      </div>
    );
  }

  // 3. Success State
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      {/* Optional top-nav element specifically for the results page */}
      <div className="mx-auto max-w-5xl py-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          Back to Form
        </Link>
      </div>
      
      <main>
        <AuditResults formData={formData} />
      </main>
    </div>
  );
}
