# Architecture & Engineering Decisions

## System Architecture

SubTract operates as a modern Next.js 15 full-stack application, utilizing the App Router for seamless server/client boundaries. The application is designed to be highly responsive, resilient to third-party API failures, and optimized for viral lead generation.

```mermaid
graph TD
    %% User Inputs
    User((User)) -->|Submits Form| UI[Next.js Client Components]
    
    %% Client-side processing
    UI -->|Stores state| Local[localStorage]
    UI -->|Calculates savings| Engine[Audit Engine (TypeScript)]
    
    %% Results processing
    Engine -->|Displays initial results| Dashboard[Results Dashboard]
    
    %% Server-side processes (triggered in parallel)
    Dashboard -->|POST /api/capture| Backend[Next.js API Route]
    Dashboard -->|POST /api/summary| AI[AI Summarizer]
    
    %% Backend integrations
    Backend -->|Persist Audit & Lead| DB[(Supabase PostgreSQL)]
    Backend -.->|Send Email (Non-blocking)| Resend[Resend API]
    
    %% AI Integration
    AI -->|Generate CFO Summary| Gemini[Gemini Pro API]
    
    %% Viral Loop
    Dashboard -->|Generates URL| Share[Shareable URL]
    Share -->|Viewed by| Visitor((New Visitor))
    Visitor -->|Clicks CTA| UI
```

## Why Next.js + Supabase?

1. **Next.js (App Router):** Selected for its hybrid rendering model. The audit engine runs entirely on the client for zero-latency feedback, while sensitive API keys (Gemini, Resend, Supabase Service Role) are kept secure in isolated Server API Routes. The dynamic OpenGraph tags on the shareable `[id]` route are generated server-side for perfect social media previews.
2. **Supabase:** Chosen over MongoDB or Prisma+PostgreSQL for its built-in Row Level Security (RLS) and instant API generation. Storing audits and leads securely is trivial, and the PostgreSQL backend ensures strong foreign-key constraints (a lead cannot exist without a valid audit ID).

## Scaling to 10,000 Audits/Day

If SubTract hits the front page of HackerNews and processes 10,000 audits per day, the current architecture would handle it with minimal changes, thanks to a few deliberate design choices:

1. **Client-Side Heavy Lifting:** The `auditEngine` math runs 100% in the user's browser. Vercel never computes the savings, meaning compute costs scale linearly with $0 server impact.
2. **AI Fallback Waterfall:** The `/api/summary` route uses Gemini Pro, which has strict rate limits. If 10k users hit it, the API will throw 429s. SubTract handles this gracefully: if the LLM fails or times out, the UI instantly falls back to a locally generated template string. The user never sees an error, and the core product loop remains unbroken.
3. **Database Pooling:** For 10k daily writes, we would enable Supabase connection pooling (Supavisor) to prevent connection exhaustion.
4. **Non-Blocking Email:** Transactional emails via Resend are fired async and wrapped in a soft `catch` block. If the email API gets throttled, the lead is still securely saved to the database.
5. **Abuse Protection (Honeypot):** The lead capture form uses a visually hidden honeypot input field (`name="honeypot"`) rather than hCaptcha. **Why?** Friction. We are capturing high-intent B2B engineering leads (CTOs and VPs). Forcing a VP of Engineering to click pictures of crosswalks creates an unacceptable drop-off rate for an enterprise funnel. The honeypot effectively traps automated spam bots while keeping the human conversion rate at an absolute maximum.
