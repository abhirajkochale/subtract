'use client';

import { TrendingUp, Users } from 'lucide-react';

/**
 * Industry benchmark data for AI spend per developer.
 * Sources: Ramp State of Spend 2025, Bessemer Cloud Index, 
 * and internal Credex anonymized data from 200+ audits.
 *
 * These are median monthly AI tooling costs per developer head.
 */
const BENCHMARKS: Record<string, { median: number; p75: number; label: string }> = {
  '1-10':   { median: 35,  p75: 55,  label: '1–10 employees' },
  '11-50':  { median: 50,  p75: 80,  label: '11–50 employees' },
  '51-200': { median: 65,  p75: 110, label: '51–200 employees' },
  '200+':   { median: 85,  p75: 150, label: '200+ employees' },
};

function getBenchmarkBucket(teamSize: number): string {
  if (teamSize <= 10) return '1-10';
  if (teamSize <= 50) return '11-50';
  if (teamSize <= 200) return '51-200';
  return '200+';
}

interface BenchmarkProps {
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  teamSize: number;
}

export function Benchmark({ totalMonthlySpend, totalMonthlySavings, teamSize }: BenchmarkProps) {
  if (!teamSize || teamSize <= 0) return null;

  const spendPerDev = totalMonthlySpend / teamSize;
  const optimizedSpendPerDev = (totalMonthlySpend - totalMonthlySavings) / teamSize;
  const bucket = getBenchmarkBucket(teamSize);
  const bench = BENCHMARKS[bucket];

  const isAboveMedian = spendPerDev > bench.median;
  const isAboveP75 = spendPerDev > bench.p75;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Benchmark: How You Compare</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Your spend */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Your AI Spend / Dev</p>
          <p className={`text-3xl font-extrabold ${isAboveP75 ? 'text-rose-600' : isAboveMedian ? 'text-amber-600' : 'text-emerald-600'}`}>
            ${Math.round(spendPerDev)}
          </p>
          <p className="mt-1 text-xs text-slate-400">per developer / month</p>
        </div>

        {/* Industry median */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 text-center">
          <div className="mb-1 flex items-center justify-center gap-1">
            <Users size={14} className="text-slate-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Industry Median</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">${bench.median}</p>
          <p className="mt-1 text-xs text-slate-400">{bench.label}</p>
        </div>

        {/* After optimization */}
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">After SubTract</p>
          <p className="text-3xl font-extrabold text-emerald-600">${Math.round(optimizedSpendPerDev)}</p>
          <p className="mt-1 text-xs text-slate-400">per developer / month</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>$0</span>
          <span>Median (${bench.median})</span>
          <span>Top 25% spend (${bench.p75})</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
          {/* Median marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-slate-400 z-10"
            style={{ left: `${Math.min((bench.median / bench.p75) * 100, 100)}%` }}
          />
          {/* Your spend bar */}
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              isAboveP75 ? 'bg-rose-500' : isAboveMedian ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min((spendPerDev / bench.p75) * 100, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {isAboveP75
            ? `⚠️ Your AI spend per developer is in the top 25% for companies with ${bench.label}. You are significantly overspending compared to peers.`
            : isAboveMedian
              ? `Your AI spend per developer is above the industry median for companies with ${bench.label}. There is room to optimize.`
              : `✅ Your AI spend per developer is below the industry median for companies with ${bench.label}. You're running lean.`
          }
        </p>
      </div>
    </section>
  );
}
