import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// SQL om tabel aan te maken in Supabase:
// create table arnobot_coaching_scores (
//   id uuid default gen_random_uuid() primary key,
//   user_id text not null,
//   mindset_score int not null,
//   systeem_score int not null,
//   actie_score int not null,
//   msa_score int not null,
//   created_at timestamptz default now()
// );
// create index on arnobot_coaching_scores (user_id, created_at desc);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ scores: [] })

  const { data } = await supabase
    .from('arnobot_coaching_scores')
    .select('mindset_score, systeem_score, actie_score, msa_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ scores: data ?? [] })
}
