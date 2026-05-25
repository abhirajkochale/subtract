'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';

interface ShareWidgetProps {
  auditId: string;
}

export function ShareWidget({ auditId }: ShareWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use the actual current domain (e.g. http://localhost:3000 or the Vercel URL)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://subtract.app';
  const embedCode = `<iframe src="${origin}/results/${auditId}" width="100%" height="800" style="border:1px solid #e2e8f0; border-radius: 12px;"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
      >
        <Share2 size={16} />
        Embed Report
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Embed this Audit</h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Copy this HTML snippet to embed a dynamic version of this audit directly on your blog, Notion, or internal wiki.
            </p>
            
            <div className="relative mb-4 rounded-md bg-slate-900 p-4">
              <pre className="overflow-x-auto text-xs leading-relaxed text-slate-300">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md bg-slate-700 p-2 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400"
                title="Copy code"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
            
            {copied && (
              <p className="text-right text-xs font-semibold text-emerald-600">
                Copied to clipboard!
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
