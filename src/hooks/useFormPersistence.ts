'use client';

/**
 * @file useFormPersistence.ts
 * @description Custom React hook that manages the audit form state and
 * persists it to `localStorage` under `credex-audit-state`.
 *
 * KEY DESIGN DECISIONS:
 * - **Hydration safety**: state initialises with deterministic defaults on
 *   the server. `localStorage` is only read inside a `useEffect` after mount.
 *   A returned `isMounted` flag lets consumers gate hydration-sensitive UI.
 * - **Debounced writes**: state is serialised to `localStorage` on every
 *   change via a separate `useEffect`, but only after `isMounted` is true
 *   (prevents overwriting saved data with empty defaults on first render).
 * - **Bridge to AuditFormData**: the `toAuditFormData()` helper maps the
 *   form-friendly state shape into the exact `AuditFormData` the engine expects.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ToolName, UseCase, AuditFormData, ToolInput } from '@/lib/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key — must match across all consumers. */
const STORAGE_KEY = 'credex-audit-state';

// ---------------------------------------------------------------------------
// Hook-local interfaces
// ---------------------------------------------------------------------------

/**
 * A single tool row in the form. Mirrors `ToolInput` but adds a stable `id`
 * for React list reconciliation and omits `enabled` (always true in the form;
 * toggled at submission time if needed).
 */
export interface FormToolEntry {
  /** Stable React key — generated via `crypto.randomUUID()`. */
  id: string;
  /** Tool slug matching the `ToolName` union. */
  toolName: string;
  /** Vendor plan name the user selects (e.g. "Individual", "Pro", "Team"). */
  plan: string;
  /** Number of licensed seats for this tool. */
  seats: number;
  /** Total monthly spend in USD for all seats combined. */
  monthlySpend: number;
}

/**
 * The full persisted form state shape.
 * Stored as JSON in `localStorage` under `credex-audit-state`.
 */
export interface FormState {
  tools: FormToolEntry[];
  teamSize: number;
  primaryUseCase: string;
}

/**
 * Partial update payload for a single tool row.
 * All fields except `id` are optional.
 */
export type FormToolUpdate = Partial<Omit<FormToolEntry, 'id'>>;

/**
 * Return type of the `useFormPersistence` hook.
 */
export interface UseFormPersistenceReturn {
  // ── State ────────────────────────────────────────────────────────────────
  /** `true` once the client has mounted and localStorage has been read. */
  isMounted: boolean;
  /** Current tool rows in the form. */
  tools: FormToolEntry[];
  /** Global team size. */
  teamSize: number;
  /** Global primary use-case. */
  primaryUseCase: string;

  // ── Tool mutations ───────────────────────────────────────────────────────
  /** Appends a new empty tool row and returns its generated `id`. */
  addTool: () => string;
  /** Partially updates the tool with the given `id`. No-op if not found. */
  updateTool: (id: string, updates: FormToolUpdate) => void;
  /** Removes the tool with the given `id`. No-op if not found. */
  removeTool: (id: string) => void;

  // ── Global field mutations ───────────────────────────────────────────────
  /** Sets the global team size. */
  setTeamSize: (size: number) => void;
  /** Sets the global primary use-case. */
  setPrimaryUseCase: (useCase: string) => void;

  // ── Helpers ──────────────────────────────────────────────────────────────
  /** Converts the current form state into the `AuditFormData` the engine expects. */
  toAuditFormData: () => AuditFormData;
  /** Resets the form to empty defaults and clears localStorage. */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** Server-safe initial state — deterministic, no browser APIs. */
function createDefaultState(): FormState {
  return {
    tools: [],
    teamSize: 1,
    primaryUseCase: 'mixed',
  };
}

/** Creates a blank tool row with a new unique ID. */
function createEmptyTool(): FormToolEntry {
  return {
    id: crypto.randomUUID(),
    toolName: '',
    plan: '',
    seats: 1,
    monthlySpend: 0,
  };
}

// ---------------------------------------------------------------------------
// localStorage helpers (never throw on quota / parse errors)
// ---------------------------------------------------------------------------

function readFromStorage(): FormState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<FormState>;

    // Validate shape — reject obviously corrupt data
    if (!Array.isArray(parsed.tools)) return null;
    if (typeof parsed.teamSize !== 'number') return null;
    if (typeof parsed.primaryUseCase !== 'string') return null;

    return {
      tools: parsed.tools,
      teamSize: parsed.teamSize,
      primaryUseCase: parsed.primaryUseCase,
    };
  } catch {
    return null;
  }
}

function writeToStorage(state: FormState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private browsing — silently drop the write.
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages the audit form state with automatic `localStorage` persistence.
 *
 * @example
 * ```tsx
 * const {
 *   isMounted, tools, teamSize, primaryUseCase,
 *   addTool, updateTool, removeTool,
 *   setTeamSize, setPrimaryUseCase,
 *   toAuditFormData, reset,
 * } = useFormPersistence();
 *
 * if (!isMounted) return <Skeleton />;
 * ```
 */
export function useFormPersistence(): UseFormPersistenceReturn {
  // ── State (server-safe defaults) ─────────────────────────────────────────
  const [isMounted, setIsMounted] = useState(false);
  const [tools, setTools] = useState<FormToolEntry[]>([]);
  const [teamSize, setTeamSizeRaw] = useState<number>(1);
  const [primaryUseCase, setPrimaryUseCaseRaw] = useState<string>('mixed');

  // ── Effect 1: Hydrate from localStorage after mount ──────────────────────
  useEffect(() => {
    const saved = readFromStorage();
    if (saved) {
      setTools(saved.tools);
      setTeamSizeRaw(saved.teamSize);
      setPrimaryUseCaseRaw(saved.primaryUseCase);
    }
    setIsMounted(true);
  }, []);

  // ── Effect 2: Persist to localStorage on every state change ──────────────
  useEffect(() => {
    // Guard: don't write until the first hydration has completed,
    // otherwise we'd overwrite real saved data with empty defaults.
    if (!isMounted) return;

    writeToStorage({ tools, teamSize, primaryUseCase });
  }, [isMounted, tools, teamSize, primaryUseCase]);

  // ── Tool mutations ───────────────────────────────────────────────────────

  const addTool = useCallback((): string => {
    const newTool = createEmptyTool();
    setTools(prev => [...prev, newTool]);
    return newTool.id;
  }, []);

  const updateTool = useCallback((id: string, updates: FormToolUpdate): void => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === id ? { ...tool, ...updates } : tool,
      ),
    );
  }, []);

  const removeTool = useCallback((id: string): void => {
    setTools(prev => prev.filter(tool => tool.id !== id));
  }, []);

  // ── Global field mutations ───────────────────────────────────────────────

  const setTeamSize = useCallback((size: number): void => {
    setTeamSizeRaw(Math.max(1, Math.round(size)));
  }, []);

  const setPrimaryUseCase = useCallback((useCase: string): void => {
    setPrimaryUseCaseRaw(useCase);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Maps the form state into the exact `AuditFormData` the engine expects.
   * Converts `toolName` strings back to the strict `ToolName` union type and
   * sets `enabled: true` on all rows (disabled rows should already have been
   * removed from the form before calling this).
   */
  const toAuditFormData = useCallback((): AuditFormData => {
    const engineTools: ToolInput[] = tools
      .filter(t => t.toolName !== '') // skip rows where the user hasn't picked a tool
      .map(t => ({
        toolName: t.toolName as ToolName,
        plan: t.plan,
        monthlySpend: t.monthlySpend,
        seats: t.seats,
        enabled: true,
      }));

    return {
      tools: engineTools,
      teamSize,
      useCase: primaryUseCase as UseCase,
    };
  }, [tools, teamSize, primaryUseCase]);

  const reset = useCallback((): void => {
    const defaults = createDefaultState();
    setTools(defaults.tools);
    setTeamSizeRaw(defaults.teamSize);
    setPrimaryUseCaseRaw(defaults.primaryUseCase);
    clearStorage();
  }, []);

  // ── Return ───────────────────────────────────────────────────────────────

  return {
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
  };
}
