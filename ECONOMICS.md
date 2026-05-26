# Unit Economics & Path to $1M ARR

SubTract itself is a free tool. It generates zero direct revenue. Its entire economic purpose is to act as a Customer Acquisition Cost (CAC) subsidy for Credex's core business: automated SaaS vendor negotiation.

## The Unit Economics of a Lead

**Cost to acquire a visitor (CAC): $0 (Initially)**
Through HackerNews, Twitter, and Slack communities, our initial traffic is organic.

**Cost to serve an audit (COGS): ~$0.01 per user**
- Vercel Hosting: Free tier (Edge network computes the React UI).
- Client-side Math: $0 (The user's browser runs the auditEngine).
- AI Summary: ~$0.01 (Gemini Pro API via Google AI Studio).
- Database & Email: ~$0.00 (Supabase and Resend free tiers).

If 1,000 people use the tool, it costs us ~$10 in API fees.

## The Conversion Funnel

We assume the following funnel metrics based on standard B2B SaaS benchmarks:
1. **Traffic:** 10,000 unique visitors/month.
2. **Audit Completion Rate (40%):** 4,000 users complete the form.
3. **Qualification Rate (25%):** 1,000 users have >$500/mo in savings (triggering the Credex CTA).
4. **Lead Capture Rate (5%):** 50 highly-qualified CTOs submit their email to "Partner with Credex".
5. **Sales Close Rate (20%):** Credex sales team closes 10 new enterprise contracts per month.

## Customer Lifetime Value (LTV)

Credex operates on a contingency model, taking a 20% cut of the savings they negotiate for the client.
- Average Series B Startup AWS/SaaS spend: $1,000,000 / year.
- Average savings negotiated by Credex: 15% ($150,000 / year).
- **Credex Revenue per Customer:** 20% of $150k = **$30,000 / year (ACV)**.

Assuming a conservative 3-year lifespan (startups churn or outgrow the tool):
**LTV = $90,000**

## Path to $1M ARR

To reach $1,000,000 in Annual Recurring Revenue (ARR), Credex needs:
* $1,000,000 / $30,000 ACV = **34 active customers**.

Using our funnel math:
To get 34 customers, we need 170 qualified leads (20% close rate).
To get 170 qualified leads, we need 3,400 qualified audits (5% capture rate).
To get 3,400 qualified audits, we need 13,600 total audits (25% qualification rate).
To get 13,600 total audits, we need **34,000 unique website visitors**.

**Conclusion:** 
If the SubTract marketing campaign (Twitter, HN, SEO) can drive 34,000 targeted engineering leaders to run a free audit over the next 18 months, the tool will successfully generate $1M ARR for Credex, all while keeping CAC incredibly low compared to traditional B2B outbound sales.
