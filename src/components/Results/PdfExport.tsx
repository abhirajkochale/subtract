'use client';

import { FileDown } from 'lucide-react';

export function PdfExport() {
  const handleExport = () => {
    window.print();
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 print:hidden"
    >
      <FileDown size={16} />
      Export PDF
    </button>
  );
}
