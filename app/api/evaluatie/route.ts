import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { naam, frequentie, onderdelen, waardevol, ontbreekt, betalen, betalenToelichting, aanbevelen, aanbevelenToelichting } = body

  const { error } = await supabase.from('arnobot_evaluaties').insert({
    naam: naam || null,
    frequentie,
    onderdelen,
    waardevol: waardevol || null,
    ontbreekt: ontbreekt || null,
    betalen,
    betalen_toelichting: betalenToelichting || null,
    aanbevelen,
    aanbevelen_toelichting: aanbevelenToelichting || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
