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

  const audit = data.audit_data;
  const savings = audit.totalMonthlySavings || 0;
  const teamSize = audit.formData?.teamSize || 1;
  const formattedSavings = savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const title = `We're wasting $${formattedSavings}/mo on AI tools`;
  const description = `I just audited our ${teamSize}-person engineering team's AI tech stack and found $${formattedSavings} in monthly savings. Click to see the exact breakdown.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
