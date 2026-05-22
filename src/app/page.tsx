/**
 * @file app/page.tsx
 * @description Landing page — renders the hero header and the AI Spend Audit form.
 *
 * Server Component — no 'use client'. SpendInputForm brings its own client
 * boundary. Design: crisp light-mode B2B SaaS (Stripe / Linear aesthetic).
 */

import { SpendInputForm } from '@/components/AuditForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top nav bar ──────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            {/* Custom geometric logo: an 'S' integrating a minus sign */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="6" fill="#0f172a" />
              {/* Top part of S */}
              <path d="M22 10C22 8.89543 21.1046 8 20 8H12C10.8954 8 10 8.89543 10 10V14C10 15.1046 10.8954 16 12 16H18" stroke="white" strokeWidth="3" strokeLinecap="round" />
              {/* Bottom part of S */}
              <path d="M10 22C10 23.1046 10.8954 24 12 24H20C21.1046 24 22 23.1046 22 22V18C22 16.8954 21.1046 16 20 16H14" stroke="white" strokeWidth="3" strokeLinecap="round" />
              {/* Minus sign in the negative space / integrated */}
              <path d="M12 16H20" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              SubTract
            </span>
          </div>

          {/* Right-side label */}
          <span className="hidden text-xs font-medium text-slate-400 sm:block">
            AI Spend Audit · Free Tool
          </span>
        </div>
      </header>

      {/* ── Centered content column ──────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

        <main>
          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section
            aria-labelledby="hero-heading"
            className="mb-10"
          >
            {/* Eyebrow */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Free · No sign-up required
            </p>

            <h1
              id="hero-heading"
              className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl"
            >
              Are you overpaying for AI?
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-500">
              Enter your team&apos;s AI tool stack below. SubTract audits each
              subscription against live pricing and surfaces exact savings —
              <strong className="font-semibold text-slate-700"> in seconds</strong>.
            </p>
          </section>

          {/* ── Form card ────────────────────────────────────────────────── */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {/*
             * SpendInputForm is a Client Component ('use client').
             * The form returns a skeleton until isMounted is true,
             * preventing any localStorage-driven hydration mismatch.
             */}
            <SpendInputForm />
          </div>

          {/* ── Disclaimer strip ──────────────────────────────────────────── */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Your data never leaves your browser.{' '}
            <span aria-hidden="true">·</span>{' '}
            Prices verified{' '}
            <time dateTime="2026-05-21">May 2026</time>
            {' '}— always check vendor pages before acting on recommendations.
          </p>
        </main>
      </div>
    </div>
  );
}
