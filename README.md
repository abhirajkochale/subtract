# SubTract

**A free AI infrastructure audit tool for high-growth startups.**
SubTract scans your engineering team's tech stack (Cursor, Copilot, ChatGPT, etc.) and instantly calculates how much money you are wasting on duplicate subscriptions and ghost seats.

> 🚀 **Live Demo:** https://subtract-gilt.vercel.app/
> 📺 **Video Walkthrough:** [Insert Loom URL Here]

## 🛠️ The Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS & shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Emails:** Resend (Transactional API)
- **AI Integration:** Google Gemini Pro API
- **Testing:** Vitest (TDD Business Logic)
- **CI/CD:** GitHub Actions

## 📖 Key Documentation

This repository contains extensive entrepreneurial and engineering documentation in the root directory:

- `ARCHITECTURE.md` - Technical scaling and system design
- `GTM.md` - $0 budget acquisition strategy
- `ECONOMICS.md` - LTV, CAC, and path to $1M ARR
- `METRICS.md` - North Star metrics and pivot triggers
- `LANDING_COPY.md` - Hero copywriting and launch strategy
- `TESTS.md` - Vitest business rules and TDD approach
- `USER_INTERVIEWS.md` - Feedback from real engineering leaders

## 🚀 Local Development

1. Clone the repository:
```bash
git clone https://github.com/abhirajkochale/SubTract.git
cd SubTract
```

2. Install dependencies:
```bash
npm install
```

3. Set up your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key
```

4. Run the development server:
```bash
npm run dev
```

5. Run the test suite:
```bash
npm run test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## ⚖️ Decisions & Trade-offs

1. **Client-Side Math:** The entire `auditEngine` runs locally in the browser rather than on the server. This reduces Vercel compute costs to $0, allowing the tool to scale infinitely as a free lead magnet without eating into margins.
2. **AI Fallbacks:** LLMs hallucinate math. Therefore, the Gemini API is *only* used for summarizing the final, pre-calculated results. If the API fails or rate-limits, the UI gracefully falls back to a deterministic template string, ensuring the user experience never breaks.
3. **Non-blocking Email:** Transactional lead-capture emails are fired asynchronously and wrapped in a soft catch block. If Resend hits a free-tier limit, the lead is still securely persisted to the Supabase database.
