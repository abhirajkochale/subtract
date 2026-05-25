'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface LeadCaptureProps {
  auditId: string;
  auditData: any;
}

export function LeadCapture({ auditId, auditData }: LeadCaptureProps) {
  const [formData, setFormData] = useState({
    email: '',
    companyName: '',
    role: '',
    teamSize: '',
    honeypot: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamSize: formData.teamSize ? parseInt(formData.teamSize, 10) : undefined,
          auditId,
          auditData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Lead capture error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 rounded-full bg-emerald-50 p-3">
          <CheckCircle2 size={28} className="text-emerald-600" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900">
          Request Received
        </h3>
        <p className="text-sm text-slate-500">
          Thank you! Our team will reach out shortly to discuss your audit results and optimization opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-900 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
        <h2 className="mb-2 text-2xl font-extrabold tracking-tight">
          Want expert help implementing these savings?
        </h2>
        <p className="mx-auto max-w-xl text-slate-400 text-sm">
          Drop your email below and the Credex team will help you automatically negotiate vendor discounts without disrupting your engineering workflows.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-10">
        {/* Honeypot field - visually hidden but accessible for bots */}
        <div className="absolute opacity-0 -z-10" aria-hidden="true">
          <label htmlFor="honeypot" tabIndex={-1}>Don't fill this out if you're human:</label>
          <input
            type="text"
            id="honeypot"
            name="honeypot"
            tabIndex={-1}
            value={formData.honeypot}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Email (Required) */}
          <div className="sm:col-span-2">
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="CTO, VP Eng, etc."
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>

          {/* Team Size */}
          <div className="sm:col-span-2">
            <label htmlFor="teamSize" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Engineering Team Size
            </label>
            <input
              type="number"
              id="teamSize"
              name="teamSize"
              min="1"
              value={formData.teamSize}
              onChange={handleChange}
              placeholder="e.g. 50"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Get Expert Help <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
