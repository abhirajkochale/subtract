import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { AuditResults } from '@/components/Results/AuditResults';

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
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <AuditResults preCalculatedResult={data.audit_data} />
      </div>
    </main>
  );
}
