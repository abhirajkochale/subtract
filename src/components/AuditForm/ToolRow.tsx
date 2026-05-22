'use client';

/**
 * @file ToolRow.tsx
 * @description A single row in the AI spend audit form.
 * Renders four fields: Tool Name, Plan, Seats, Monthly Spend.
 * The Plan <select> is dynamically populated based on the selected tool.
 *
 * Accessibility:
 * - Every <input> and <select> is bound to a <label> via matching htmlFor/id.
 * - The delete button carries an aria-label with the tool name for context.
 */

import { Trash2 } from 'lucide-react';
import type { FormToolEntry, FormToolUpdate } from '@/hooks/useFormPersistence';

// ---------------------------------------------------------------------------
// Plan catalogue (rubric-specified options per tool)
// ---------------------------------------------------------------------------

/**
 * Map from tool slug to the ordered list of plan names the user may select.
 * Kept here — not imported from pricingData — so the UI layer can include
 * rubric-mandated options (e.g. "Enterprise", "API direct") that aren't yet
 * in the pricing catalogue.
 */
const TOOL_PLANS: Record<string, string[]> = {
  cursor:          ['Hobby', 'Individual', 'Teams', 'Enterprise'],
  'github-copilot': ['Individual', 'Business', 'Enterprise'],
  claude:          ['Free', 'Pro', 'Max', 'Team', 'Enterprise', 'API direct'],
  chatgpt:         ['Plus', 'Team', 'Enterprise', 'API direct'],
  'anthropic-api': ['API direct'],
  'openai-api':    ['API direct'],
  gemini:          ['Pro', 'Ultra', 'API'],
  windsurf:        ['Free', 'Pro', 'Enterprise'],
};

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor:          'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude:          'Claude',
  chatgpt:         'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api':    'OpenAI API',
  gemini:          'Gemini',
  windsurf:        'Windsurf',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ToolRowProps {
  /** The tool entry to render. */
  entry: FormToolEntry;
  /** Row index, used to generate unique HTML ids. */
  index: number;
  /** Called when any field changes. */
  onUpdate: (id: string, updates: FormToolUpdate) => void;
  /** Called when the user clicks the delete button. */
  onRemove: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ToolRow({ entry, index, onUpdate, onRemove }: ToolRowProps) {
  const rowId = `tool-row-${index}`;
  const plans = entry.toolName ? (TOOL_PLANS[entry.toolName] ?? []) : [];
  const displayName = entry.toolName
    ? (TOOL_DISPLAY_NAMES[entry.toolName] ?? entry.toolName)
    : `Tool ${index + 1}`;

  function handleToolChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newTool = e.target.value;
    const firstPlan = TOOL_PLANS[newTool]?.[0] ?? '';
    // Reset plan when tool changes so the dropdown is never out-of-sync
    onUpdate(entry.id, { toolName: newTool, plan: firstPlan });
  }

  return (
    <article
      className="relative grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_100px_120px_40px]"
      aria-label={`${displayName} row ${index + 1}`}
    >
      {/* ── Tool Name ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${rowId}-tool`}
          className="text-xs font-medium text-slate-500"
        >
          Tool
        </label>
        <select
          id={`${rowId}-tool`}
          name={`${rowId}-tool`}
          value={entry.toolName}
          onChange={handleToolChange}
          required
          className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <option value="" disabled>Select tool…</option>
          {Object.entries(TOOL_DISPLAY_NAMES).map(([slug, label]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>
      </div>

      {/* ── Plan ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${rowId}-plan`}
          className="text-xs font-medium text-slate-500"
        >
          Plan
        </label>
        <select
          id={`${rowId}-plan`}
          name={`${rowId}-plan`}
          value={entry.plan}
          onChange={e => onUpdate(entry.id, { plan: e.target.value })}
          required
          disabled={plans.length === 0}
          aria-disabled={plans.length === 0}
          className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50"
        >
          {plans.length === 0 ? (
            <option value="">— select tool first —</option>
          ) : (
            plans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))
          )}
        </select>
      </div>

      {/* ── Seats ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${rowId}-seats`}
          className="text-xs font-medium text-slate-500"
        >
          Seats
        </label>
        <input
          id={`${rowId}-seats`}
          name={`${rowId}-seats`}
          type="number"
          min={1}
          step={1}
          value={entry.seats}
          onChange={e => onUpdate(entry.id, { seats: Math.max(1, parseInt(e.target.value, 10) || 1) })}
          required
          className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        />
      </div>

      {/* ── Monthly Spend ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor={`${rowId}-spend`}
          className="text-xs font-medium text-slate-500"
        >
          Monthly spend ($)
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400"
          >
            $
          </span>
          <input
            id={`${rowId}-spend`}
            name={`${rowId}-spend`}
            type="number"
            min={0}
            step={0.01}
            value={entry.monthlySpend}
            onChange={e => onUpdate(entry.id, { monthlySpend: parseFloat(e.target.value) || 0 })}
            required
            className="h-9 w-full rounded-md border border-slate-200 bg-white pl-6 pr-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          />
        </div>
      </div>

      {/* ── Delete ────────────────────────────────────────────────────────── */}
      <div className="flex items-end">
        <button
          type="button"
          onClick={() => onRemove(entry.id)}
          aria-label={`Remove ${displayName} row ${index + 1}`}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition-all duration-200 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
