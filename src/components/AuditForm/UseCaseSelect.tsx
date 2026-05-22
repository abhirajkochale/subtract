'use client';

/**
 * @file UseCaseSelect.tsx
 * @description Standalone accessible select for "Primary use case".
 * Extracted so it can be unit-tested and reused independently.
 */

const USE_CASES = ['coding', 'writing', 'data', 'research', 'mixed'] as const;
export type UseCaseOption = (typeof USE_CASES)[number];

interface UseCaseSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

export function UseCaseSelect({ id = 'primary-use-case', value, onChange }: UseCaseSelectProps) {
  return (
    <select
      id={id}
      name={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      required
      className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {USE_CASES.map(uc => (
        <option key={uc} value={uc}>
          {uc.charAt(0).toUpperCase() + uc.slice(1)}
        </option>
      ))}
    </select>
  );
}
