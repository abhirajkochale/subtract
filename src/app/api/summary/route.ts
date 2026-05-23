import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Make sure to set GEMINI_API_KEY in your environment variables
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { teamSize, primaryUseCase, totalMonthlySavings, toolResults } = body;

  const fallbackSummary = `Based on our audit of your ${teamSize || 0}-person team's stack, we identified $${totalMonthlySavings || 0}/mo in optimization opportunities. Please review the specific tool adjustments below.`;

  try {
    // Basic validation
    if (teamSize === undefined || !primaryUseCase || totalMonthlySavings === undefined || !toolResults) {
      throw new Error('Missing required fields');
    }

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const fallbackModels = [
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest'
    ];

    const prompt = `Act as a fractional CFO. Look at this startup's tech stack data: Team Size: ${teamSize}, Primary Use Case: ${primaryUseCase}, Total Monthly Savings: $${totalMonthlySavings}, Tool Results: ${JSON.stringify(toolResults)}. Write a highly professional, single-paragraph summary (~100 words) analyzing the user's stack. Note the specific dollar amount of overspend, and advise consolidation based on the provided tool data.`;

    let responseText = null;
    let lastError = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break; // Success! Exit the loop
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or quota exhausted. Trying next model...`);
        lastError = err;
      }
    }

    if (!responseText) {
      console.error('All fallback models exhausted. Last error:', lastError);
      throw new Error('All Gemini models exhausted');
    }

    return NextResponse.json({ summary: responseText.trim() });
  } catch (error) {
    console.error('Gemini API Error:', error);
    // CRITICAL FALLBACK
    return NextResponse.json({ summary: fallbackSummary }, { status: 200 });
  }
}
