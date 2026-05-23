import { runAudit } from '@/lib/auditEngine';
import type { AuditFormData } from '@/lib/types';
import { TOOL_DISPLAY_NAMES } from '@/lib/pricingData';
import { CheckCircle2, TrendingDown, AlertCircle, ArrowRight, Building2 } from 'lucide-react';

interface AuditResultsProps {
  formData: AuditFormData;
}

export function AuditResults({ formData }: AuditResultsProps) {
  // Run the engine
  const result = runAudit(formData);

  const { totalMonthlySavings, totalAnnualSavings, toolResults } = result;

  const hasAnomalies = toolResults.some(tr => 
    tr.reason.toLowerCase().includes('anomaly') || 
    tr.recommendedAction.toLowerCase().includes('audit your')
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-20 pt-8">
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
        <h1 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Identified Savings
        </h1>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
              ${totalMonthlySavings.toLocaleString()}
            </span>
            <span className="text-xl font-medium text-slate-500">/mo</span>
          </div>
          <p className="text-lg font-medium text-emerald-600 sm:text-xl">
            ${totalAnnualSavings.toLocaleString()} saved annually
          </p>
        </div>
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

      {!hasAnomalies && totalMonthlySavings < 100 && (
        <section className="flex items-start gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
          <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="mb-1 text-base font-bold text-slate-900">
              You&apos;re spending well
            </h2>
            <p className="text-sm text-slate-600">
              Your stack is highly optimized. We couldn&apos;t find any major overlapping subscriptions or overpriced tiers based on your current team size and use-case.
            </p>
          </div>
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
            const isFlag = tr.recommendationType === 'flag';
            const isOptimal = tr.recommendationType === 'already-optimal';
            
            return (
              <article
                key={`${tr.toolName}-${idx}`}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
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
                    {tr.savings > 0 && (
                      <div className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                        <TrendingDown size={14} />
                        ${tr.savings.toLocaleString()}/mo
                      </div>
                    )}
                    {isFlag && (
                      <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
                        <AlertCircle size={14} />
                        Review
                      </div>
                    )}
                    {isOptimal && (
                      <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-600">
                        <CheckCircle2 size={14} />
                        Optimal
                      </div>
                    )}
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
    </div>
  );
}
