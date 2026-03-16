import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Question labels per segment (subset — most important for alignment)
const QUESTION_LABELS: Record<string, string> = {
  'strategie-1':  'Wat is uw primaire verkoopstrategie?',
  'strategie-2':  'Hoe definieert u uw ideale klantprofiel?',
  'strategie-3':  'Wat is uw go-to-market aanpak?',
  'strategie-4':  'Hoe differentieert u zich van concurrenten?',
  'strategie-5':  'Wat zijn uw top 3 salesprioriteiten dit jaar?',
  'mensen-1':     'Hoe beoordeelt u de kwaliteit van uw salesteam?',
  'mensen-2':     'Wat is uw aanpak voor salescoaching?',
  'mensen-3':     'Hoe meet u individuele salesprestaties?',
  'uitvoering-1': 'Hoe ziet uw salesproces eruit?',
  'uitvoering-2': 'Hoe meet u salesperformance op teamniveau?',
  'uitvoering-3': 'Wat zijn uw belangrijkste sales KPIs?',
  'uitvoering-4': 'Hoe gaat u om met pipeline management?',
};

interface AnswerRow {
  user_id: string;
  question_id: string;
  answer: string;
  score: number | null;
}

interface QuestionAlignment {
  question_id: string;
  label: string;
  score: number;       // 1–5
  diagnose: string;
  segment: string;
}

interface AlignmentResult {
  overall: number;
  strategie: number;
  mensen: number;
  uitvoering: number;
  questions: QuestionAlignment[];
  calculated_at: string;
}

async function analyseQuestion(questionId: string, answers: string[]): Promise<{ score: number; diagnose: string }> {
  const label = QUESTION_LABELS[questionId] ?? questionId;
  const answersText = answers.map((a, i) => `Lid ${i + 1}: "${a}"`).join('\n');

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Je analyseert de mate van alignment binnen een salesteam.

Vraag: "${label}"

Antwoorden van ${answers.length} teamleden:
${answersText}

Geef een alignment score van 1–5:
1 = volledig tegenstrijdig, grote meningsverschillen
2 = weinig overlap, duidelijke divergentie  
3 = gedeeltelijk aligned, enkele overeenkomsten
4 = grotendeels aligned, kleine nuanceverschillen
5 = volledig op één lijn, consistent beeld

Geef ook een korte diagnose (max 12 woorden in het Nederlands).

Reageer ALLEEN met valid JSON, geen markdown, geen uitleg:
{"score": 3, "diagnose": "Team zit niet op één lijn over prioriteiten"}`
    }]
  });

  const text = msg.content.find(b => b.type === 'text')?.text ?? '{"score":3,"diagnose":"Onvoldoende data"}';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { score: 3, diagnose: 'Analyse niet beschikbaar' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

    // Get Supabase token from request body (passed from client)
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: 'Geen token' }, { status: 400 });

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Verify manager
    const { data: managerCheck } = await db
      .from('approved_users')
      .select('is_manager')
      .eq('user_id', userId)
      .single();

    if (!managerCheck?.is_manager) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    // Fetch all answers
    const { data: answers, error: ae } = await db
      .from('canvas_answers')
      .select('user_id, question_id, answer, score');

    if (ae || !answers) throw ae;

    // Group answers by question_id, filter for questions with 2+ non-empty answers
    const byQuestion: Record<string, string[]> = {};
    (answers as AnswerRow[]).forEach(row => {
      if (row.answer && row.answer.trim() !== '') {
        if (!byQuestion[row.question_id]) byQuestion[row.question_id] = [];
        byQuestion[row.question_id].push(row.answer.trim());
      }
    });

    // Only analyse questions we have labels for AND have 2+ answers
    const eligibleIds = Object.entries(byQuestion)
      .filter(([qid, ans]) => QUESTION_LABELS[qid] && ans.length >= 2)
      .map(([qid]) => qid);

    if (eligibleIds.length === 0) {
      return NextResponse.json({ error: 'Onvoldoende teamdata voor analyse (minimaal 2 teamleden met ingevulde antwoorden)' }, { status: 400 });
    }

    // Analyse all eligible questions (parallel, max 6 at a time to avoid rate limits)
    const results: QuestionAlignment[] = [];
    const chunks = [];
    for (let i = 0; i < eligibleIds.length; i += 6) chunks.push(eligibleIds.slice(i, i + 6));

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(async (qid) => {
          const { score, diagnose } = await analyseQuestion(qid, byQuestion[qid]);
          const segment = qid.split('-')[0];
          return {
            question_id: qid,
            label: QUESTION_LABELS[qid],
            score,
            diagnose,
            segment,
          };
        })
      );
      results.push(...chunkResults);
    }

    // Calculate segment averages (convert 1–5 to 0–100%)
    const segmentScore = (seg: string) => {
      const sq = results.filter(r => r.segment === seg);
      if (!sq.length) return 0;
      return Math.round(((sq.reduce((s, r) => s + r.score, 0) / sq.length) - 1) / 4 * 100);
    };

    const strategie  = segmentScore('strategie');
    const mensen     = segmentScore('mensen');
    const uitvoering = segmentScore('uitvoering');

    // Weighted overall (same weights as health score)
    const overall = Math.round(strategie * 0.3 + mensen * 0.4 + uitvoering * 0.3);

    const alignmentResult: AlignmentResult = {
      overall, strategie, mensen, uitvoering,
      questions: results.sort((a, b) => a.score - b.score), // worst first
      calculated_at: new Date().toISOString(),
    };

    // Cache in Supabase (upsert on manager user_id)
    await db.from('canvas_alignment').upsert({
      user_id: userId,
      result: alignmentResult,
      calculated_at: alignmentResult.calculated_at,
    }, { onConflict: 'user_id' });

    return NextResponse.json(alignmentResult);
  } catch (err) {
    console.error('Alignment error:', err);
    return NextResponse.json({ error: 'Analyse mislukt' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

    const token = req.headers.get('x-supabase-token');
    if (!token) return NextResponse.json({ error: 'Geen token' }, { status: 400 });

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data } = await db
      .from('canvas_alignment')
      .select('result, calculated_at')
      .eq('user_id', userId)
      .single();

    if (!data) return NextResponse.json({ cached: null });
    return NextResponse.json({ cached: data.result });
  } catch {
    return NextResponse.json({ cached: null });
  }
}
