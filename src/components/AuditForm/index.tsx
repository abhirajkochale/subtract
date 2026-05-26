'use client';

/**
 * @file AuditForm/index.tsx
 * @description Interactive AI Spend Audit form.
 *
 * ARCHITECTURE:
 * - 'use client' — uses hooks, event handlers, and localStorage.
 * - State managed entirely via `useFormPersistence` (localStorage-backed).
 * - Hydration-safe: returns a skeleton while `isMounted` is false to prevent
 *   a React hydration mismatch between server HTML and client localStorage state.
 * - Submits by converting form state → AuditFormData via `toAuditFormData()`,
 *   then POSTing to /api/audit.
 *
 * Accessibility:
 * - Landmark <main> wraps the page; this component renders a <form> with role="form".
 * - All inputs have associated <label> elements via htmlFor/id pairs.
 * - Icon-only buttons carry aria-label.
 * - Error messages are surfaced via aria-live="polite".
 * - Focus is managed to the first new tool row after "Add Tool".
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Sparkles, RotateCcw } from 'lucide-react';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { ToolRow } from './ToolRow';
import { UseCaseSelect } from './UseCaseSelect';

// ---------------------------------------------------------------------------
// Skeleton — shown until localStorage hydration completes
// ---------------------------------------------------------------------------

function FormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your saved audit data…"
      aria-busy="true"
      className="w-full animate-pulse space-y-4"
    >
      {/* Fake header */}
      <div className="h-5 w-40 rounded bg-slate-100" />
      {/* Fake tool rows */}
      {[1, 2].map(i => (
        <div
          key={i}
          className="h-20 w-full rounded-lg bg-slate-100"
          aria-hidden="true"
        />
      ))}
      {/* Fake global inputs */}
      <div className="h-16 w-full rounded-lg bg-slate-100" aria-hidden="true" />
      {/* Fake submit button */}
      <div className="h-10 w-full rounded-lg bg-slate-100" aria-hidden="true" />
      <span className="sr-only">Loading saved audit data from local storage…</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SpendInputForm() {
  const router = useRouter();
  const {
    isMounted,
    tools,
    teamSize,
    primaryUseCase,
    addTool,
    updateTool,
    removeTool,
    setTeamSize,
    setPrimaryUseCase,
    toAuditFormData,
    reset,
  // Local state lets the user backspace the input entirely without it forcefully resetting to 0/1 mid-type.
  const [localTeamSize, setLocalTeamSize] = useState(teamSize.toString());
  const [prevTeamSize, setPrevTeamSize] = useState(teamSize);

  // Sync external updates back to local state during render (avoids useEffect lint errors and extra renders)
  if (teamSize !== prevTeamSize) {
    setPrevTeamSize(teamSize);
    setLocalTeamSize(teamSize.toString());
  }

  /** Ref to the last tool row so we can focus it after adding. */
  const lastRowRef = useRef<HTMLElement | null>(null);

  // ── Handlers (must be declared before ANY early return — Rules of Hooks) ─

  const handleAddTool = useCallback(() => {
    addTool();
    // Defer focus until the new row is in the DOM
    setTimeout(() => {
      const rows = document.querySelectorAll('[data-tool-row]');
      const last = rows[rows.length - 1];
      const firstSelect = last?.querySelector('select') as HTMLSelectElement | null;
      firstSelect?.focus();
    }, 50);
  }, [addTool]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (tools.length === 0) return;

      const payload = toAuditFormData();

      // Store the payload in sessionStorage for the results page to read
      sessionStorage.setItem('credex-audit-payload', JSON.stringify(payload));
      router.push('/audit');
    },
    [tools, toAuditFormData, router],
  );

  const handleReset = useCallback(() => {
    if (window.confirm('Reset your entire audit? This cannot be undone.')) {
      reset();
    }
  }, [reset]);

  // ── Hydration guard (after all hooks) ────────────────────────────────────
  if (!isMounted) return <FormSkeleton />;

  // ── Derived values (not hooks — safe to compute after the guard) ─────────
  const hasTools = tools.length > 0;
  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="AI Spend Audit Form"
      noValidate
      className="flex flex-col divide-y divide-slate-100"
    >
      {/* ── Section: Tool Stack ─────────────────────────────────────────── */}
      <section aria-labelledby="tools-heading" className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="tools-heading"
            className="text-sm font-semibold text-slate-900"
          >
            Your AI Tool Stack
            {hasTools && (
              <span
                className="ml-2 font-normal text-slate-400"
                aria-live="polite"
              >
                ({tools.length} {tools.length === 1 ? 'tool' : 'tools'} ·{' '}
                <span aria-label={`Total monthly spend: $${totalMonthlySpend.toFixed(2)}`}>
                  ${totalMonthlySpend.toFixed(2)}/mo
                </span>
                )
              </span>
            )}
          </h2>
        </div>

        {/* Tool rows */}
        {!hasTools && (
          <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            No tools added yet. Click{' '}
            <strong className="font-medium text-slate-600">Add Tool</strong> to start your audit.
          </p>
        )}

        <div
          className="flex flex-col gap-3"
          role="list"
          aria-label="Tool rows"
        >
          {tools.map((entry, index) => (
            <div
              key={entry.id}
              role="listitem"
              data-tool-row
              ref={index === tools.length - 1 ? (el) => { lastRowRef.current = el; } : undefined}
            >
              <ToolRow
                entry={entry}
                index={index}
                onUpdate={updateTool}
                onRemove={removeTool}
              />
            </div>
          ))}
        </div>

        {/* Add tool button */}
        <button
          type="button"
          onClick={handleAddTool}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Add a new tool row to the audit"
        >
          <PlusCircle size={15} aria-hidden="true" />
          Add Tool
        </button>
      </section>

      {/* ── Section: Global Settings ─────────────────────────────────────── */}
      <section aria-labelledby="global-heading" className="p-6">
        <h2
          id="global-heading"
          className="mb-4 text-sm font-semibold text-slate-900"
        >
          Team Context
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Team size */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="team-size"
              className="text-xs font-medium text-slate-500"
            >
              Team size
              <span className="ml-1 text-slate-400">(total headcount)</span>
            </label>
            <input
              id="team-size"
              name="team-size"
              type="number"
              min={1}
              step={1}
              value={localTeamSize}
              onChange={e => {
                const val = e.target.value;
                setLocalTeamSize(val);
                const num = parseInt(val, 10);
                setTeamSize(isNaN(num) ? 0 : Math.max(0, num));
              }}
              required
              aria-describedby="team-size-hint"
              className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            />
            <span id="team-size-hint" className="text-xs text-slate-400">
              Used to flag seat-count anomalies
            </span>
          </div>

          {/* Primary use case */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="primary-use-case"
              className="text-xs font-medium text-slate-500"
            >
              Primary use case
            </label>
            <UseCaseSelect
              id="primary-use-case"
              value={primaryUseCase}
              onChange={setPrimaryUseCase}
            />
          </div>
        </div>
      </section>

      {/* ── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset the entire audit form and clear saved data"
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
        >
          <RotateCcw size={13} aria-hidden="true" />
          Reset
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={!hasTools}
          aria-disabled={!hasTools}
          aria-describedby={!hasTools ? 'submit-hint' : undefined}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles size={14} aria-hidden="true" />
          Run Audit
        </button>
      </div>

      {!hasTools && (
        <p id="submit-hint" className="px-6 pb-4 text-center text-xs text-slate-400" aria-live="polite">
          Add at least one tool to run the audit.
        </p>
      )}
    </form>
  );
}
