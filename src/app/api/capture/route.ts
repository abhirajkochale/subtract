/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, companyName, role, teamSize, auditId, auditData, honeypot } = body;

    // Abuse Protection: Honeypot check
    if (honeypot && honeypot.length > 0) {
      console.warn('Bot detected: Honeypot field filled out.');
      // Return 200 OK to trick the bot
      return NextResponse.json({ success: true, message: 'Received' }, { status: 200 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Database Insertion: Audits Table (Must happen before leads for foreign key)
    if (auditId && auditData) {
      const { error: auditError } = await supabase
        .from('audits')
        .upsert([{ id: auditId, audit_data: auditData }]);
      
      if (auditError) {
        console.error('Database audit insertion error:', auditError);
        throw new Error(`DB Error: ${auditError.message}`);
      }
    }

    // Database Insertion: Leads Table
    const { error: dbError } = await supabase
      .from('leads')
      .insert([
        {
          email,
          company_name: companyName,
          role,
          team_size: teamSize,
          audit_id: auditId,
        },
      ]);

    if (dbError) {
      console.error('Database leads insertion error:', dbError);
      throw new Error(`DB Error: ${dbError.message}`);
    }

    // Transactional Email (best-effort — Resend free tier only sends to verified addresses)
    let emailSent = false;
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Your AI Spend Audit Results',
        html: `
          <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto;">
            <h2>Thanks for using the Credex AI Auditor!</h2>
            <p>We've successfully received your AI spend audit submission.</p>
            <p>Our team is reviewing your optimized stack, and we will reach out shortly to discuss how Credex can help you negotiate these vendor discounts automatically.</p>
            <br />
            <p>Best regards,</p>
            <p><strong>The Credex Team</strong></p>
          </div>
        `,
      });

      if (emailError) {
        console.warn('Resend email warning (non-blocking):', emailError.message);
      } else {
        emailSent = true;
      }
    } catch (emailCatchError) {
      console.warn('Email delivery skipped (Resend free-tier restriction):', emailCatchError);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Lead saved and email sent successfully.'
        : 'Lead saved successfully. Email delivery skipped (Resend free-tier restriction — verify a custom domain at resend.com/domains to enable sending to all addresses).',
    }, { status: 200 });
  } catch (error: any) {
    console.error('API /capture error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
