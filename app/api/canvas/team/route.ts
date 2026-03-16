import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Service role client — bypasses RLS
const serviceDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });

    // Verify manager via service role
    const { data: managerCheck } = await serviceDb
      .from('approved_users')
      .select('is_manager')
      .eq('user_id', userId)
      .single();

    if (!managerCheck?.is_manager) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
    }

    // Fetch all approved users
    const { data: approvedUsers, error: ue } = await serviceDb
      .from('approved_users')
      .select('user_id, email');

    if (ue || !approvedUsers) throw ue;

    // Fetch all answers
    const { data: answers, error: ae } = await serviceDb
      .from('canvas_answers')
      .select('user_id, question_id, score, answer');

    if (ae) throw ae;

    return NextResponse.json({ approvedUsers, answers });
  } catch (err) {
    console.error('Team data error:', err);
    return NextResponse.json({ error: 'Fout bij laden teamdata' }, { status: 500 });
  }
}
