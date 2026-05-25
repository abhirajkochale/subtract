'use client';

import { useState, useEffect, useRef } from 'react';
import { runAudit } from '@/lib/auditEngine';
import type { AuditFormData, RecommendationType, AuditResult } from '@/lib/types';
import { TOOL_DISPLAY_NAMES } from '@/lib/pricingData';
import { CheckCircle2, AlertCircle, ArrowRight, Building2, Trash2, ArrowDownRight, Eye, CheckCircle } from 'lucide-react';
import { LeadCapture } from '@/components/LeadCapture';
import { ShareWidget } from './ShareWidget';
import Link from 'next/link';

function getSemanticTheme(type: RecommendationType) {
  switch (type) {
    case 'optimize':
    case 'switch':
      return {
        tag: 'bg-rose-50 text-rose-700',
        icon: Trash2,
        label: 'Drop',
      };
    case 'downgrade':
      return {
        tag: 'bg-amber-50 text-amber-700',
        icon: ArrowDownRight,
        label: 'Downgrade',
      };
    case 'flag':
      return {
        tag: 'bg-indigo-50 text-indigo-700',
        icon: Eye,
        label: 'Review',
      };
    case 'already-optimal':
    default:
      return {
        tag: 'bg-emerald-50 text-emerald-700',
        icon: CheckCircle,
        label: 'Optimal',
      };
  }
}

interface AuditResultsProps {
  formData?: AuditFormData;
  preCalculatedResult?: AuditResult;
}

export function AuditResults({ formData, preCalculatedResult }: AuditResultsProps) {
  // If we have a pre-calculated result (e.g. from the shareable link), use it.
  // Otherwise, run the engine on the formData.
  const result = preCalculatedResult || (formData ? runAudit(formData) : null);

  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const fetched = useRef(false);

  useEffect(() => {
    if (!result) return;
    if (fetched.current) return;
    fetched.current = true;

    const { totalMonthlySavings, toolResults, formData: finalFormData } = result;

    async function fetchSummary() {
      try {
        const response = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamSize: finalFormData.teamSize,
            primaryUseCase: finalFormData.useCase,
            totalMonthlySavings,
            toolResults,
          }),
        });
        const data = await response.json();
        setSummary(data.summary);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
        setSummary(`Based on our audit of your ${finalFormData.teamSize}-person team's stack, we identified $${totalMonthlySavings}/mo in optimization opportunities. Please review the specific tool adjustments below.`);
      } finally {
        setIsSummaryLoading(false);
      }
    }

    fetchSummary();
  }, [result]);

  if (!result) return null;

  const { totalMonthlySavings, totalAnnualSavings, toolResults } = result;

  const hasAnomalies = toolResults.some(tr => 
    tr.reason.toLowerCase().includes('anomaly') || 
    tr.recommendedAction.toLowerCase().includes('audit your')
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-20 pt-8">
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 shadow-sm sm:p-16">
        <div className="absolute right-6 top-6 hidden sm:block">
          <ShareWidget auditId={result.id} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          <div className="flex flex-col items-center">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
              Monthly Savings
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
                ${totalMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="hidden h-24 w-px bg-slate-200 sm:block"></div>
          <div className="flex flex-col items-center">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Annual Savings
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-extrabold tracking-tight text-emerald-600 sm:text-7xl">
                ${totalAnnualSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {totalMonthlySavings < 100 && (
          <div className="mt-10 flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-2 text-base font-bold text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={18} />
            You&apos;re spending well.
          </div>
        )}
      </section>

      {/* ── CFO Summary ────────────────────────────────────────────────────── */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Executive Summary</h2>
        {isSummaryLoading ? (
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100"></div>
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100"></div>
            <div className="h-4 w-4/6 animate-pulse rounded bg-slate-100"></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {summary}
          </p>
        )}
      </section>

      {/* ── Conditional CTA ────────────────────────────────────────────────── */}
      {totalMonthlySavings > 500 && (
        <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50 p-6 sm:p-8 shadow-sm">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Partner with Credex
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                Your infrastructure spend indicates significant optimization opportunities. Credex helps high-growth startups automatically negotiate and capture these vendor discounts without disrupting your engineering team.
              </p>
            </div>
            <button
              type="button"
              className="flex whitespace-nowrap items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Get Expert Help <ArrowRight size={16} />
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" aria-hidden="true" />
        </section>
      )}

      {totalMonthlySavings < 100 && (
        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 rounded-xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="mb-1 text-lg font-bold text-slate-900">
                You&apos;re spending well.
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 max-w-lg">
                Your stack is highly optimized. We couldn&apos;t find any major overlapping subscriptions or overpriced tiers based on your current team size and use-case.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex whitespace-nowrap items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full lg:w-auto"
          >
            notify me when new optimizations apply to your stack
          </button>
        </section>
      )}

      {hasAnomalies && (
        <section className="flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mt-0.5 rounded-full bg-amber-100 p-1.5">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="mb-1 text-base font-bold text-amber-900">
              Billing Anomalies Detected
            </h2>
            <p className="text-sm text-amber-800">
              Your reported spend significantly exceeds published vendor pricing. Review your invoices immediately for hidden seats or billing errors.
            </p>
          </div>
        </section>
      )}

      {/* ── Per-Tool Breakdown ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          Tool Breakdown & Recommendations
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {toolResults.map((tr, idx) => {
            const displayName = TOOL_DISPLAY_NAMES[tr.toolName] || tr.toolName;
            const theme = getSemanticTheme(tr.recommendationType);

            return (
              <article
                key={`${tr.toolName}-${idx}`}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-default"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {displayName}
                      </h3>
                      <p className="text-sm font-medium text-slate-500">
                        Current Spend: ${tr.currentSpend.toLocaleString()}/mo
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${theme.tag}`}>
                      <theme.icon size={16} />
                      {tr.savings > 0 ? `$${tr.savings.toLocaleString()}/mo` : theme.label}
                    </div>
                  </div>

                  <h4 className="mb-2 text-sm font-bold text-slate-900">
                    {tr.recommendedAction}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {tr.reason}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Lead Capture or Viral CTA ───────────────────────────────────────── */}
      <section className="pt-4">
        {preCalculatedResult ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">
              Want to see where your team is overspending?
            </h3>
            <p className="mb-8 text-slate-500 max-w-lg mx-auto">
              Run a free AI infrastructure audit for your startup and get a personalized, defensible breakdown of exactly where you can cut costs.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
            >
              Audit My Stack
            </Link>
          </div>
        ) : (
          <LeadCapture auditId={result.id} auditData={result} />
        )}
      </section>
    </div>
  );
}
