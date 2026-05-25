import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;

  const { data } = await supabase
    .from('audits')
    .select('audit_data')
    .eq('id', id)
    .single();

  if (!data) {
    return {
      title: 'Audit Not Found | SubTract',
    };
  }

  return {
    title: 'AI Spend Audit | Immediate savings found',
    description: 'View your team\'s AI stack optimization report and immediate savings opportunities.',
    openGraph: {
      title: 'AI Spend Audit | Immediate savings found',
      description: 'View your team\'s AI stack optimization report and immediate savings opportunities.',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Spend Audit | Immediate savings found',
      description: 'View your team\'s AI stack optimization report and immediate savings opportunities.',
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('audits')
    .select('audit_data')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Audit Results Snapshot
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Below is the raw audit payload loaded dynamically from Supabase.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 px-4 py-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              audit_data.json
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800">
              {JSON.stringify(data.audit_data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
