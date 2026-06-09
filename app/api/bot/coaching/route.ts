import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { getRelevantChunks } from '@/lib/rag'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { data, error } = await supabase
    .from('arnobot_coaching')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) console.error('[coaching GET]', error.message)
  return NextResponse.json({ coaching: data ?? null })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const [sessionsRes, analysesRes, profielRes] = await Promise.all([
    supabase
      .from('arnobot_blog_sessions')
      .select('title, summary, message_count, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(100),
    supabase
      .from('arnobot_analyses')
      .select('analyse_text, created_at, session_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('arnobot_blog_profiles')
      .select('profiel')
      .eq('user_id', userId)
      .single(),
  ])

  const sessions = sessionsRes.data ?? []
  if (sessions.length < 5) {
    return NextResponse.json({ error: 'te_weinig', count: sessions.length }, { status: 400 })
  }

  const analyses = analysesRes.data ?? []
  const profiel = profielRes.data?.profiel ?? null
  const profielText = profiel
    ? `\n\nGEBRUIKERSPROFIEL:\nRol: ${profiel.rol || '—'}\nMarkt: ${Array.isArray(profiel.markt) ? profiel.markt.join(', ') : profiel.markt || '—'}\nWat verkoop je: ${profiel.wat_verkoop_je || '—'}\nIdeale klant: ${profiel.ideale_klant || '—'}\nGrootste uitdaging: ${profiel.uitdaging || '—'}`
    : ''

  const sessiesText = sessions
    .map((s, i) =>
      `Gesprek ${i + 1} (${new Date(s.created_at).toLocaleDateString('nl-NL')}, ${s.message_count} vragen): ${s.title}${s.summary ? `\nSamenvatting: ${s.summary}` : ''}`
    )
    .join('\n\n')

  const analysesText = analyses.length > 0
    ? '\n\nEERDERE PATROONANALYSES (meest recent eerst):\n' + analyses
        .map((a, i) =>
          `Analyse ${i + 1} (${new Date(a.created_at).toLocaleDateString('nl-NL')}, ${a.session_count} gesprekken):\n${a.analyse_text}`
        )
        .join('\n\n')
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1600,
    system: `Je bent Arno Diepeveen. Salesstrateeg, 20 jaar ervaring, direct en ongefilterd. Je schrijft een persoonlijk coachingsdocument gebaseerd op drie pijlers: Mindset, Systeem en Actie. Geen corporate coachtaal. Geen bullshit. Geen accenten op woorden voor nadruk. Spreek de gebruiker aan met "je".

MINDSET = hoe iemand in de wedstrijd zit. Geloof in zichzelf, zelfimage als verkoper, positief of negatief taalgebruik, excuses maken of verantwoordelijkheid nemen.
SYSTEEM = heeft iemand een verkoopproces? Volgt die dat consequent? Pipeline-denken, opvolging, structuur, terugkomen op dingen. Sales is een proces, geen vak.
ACTIE = doet iemand het ook echt? Gesprekken voeren, initiatief nemen, consistent actief blijven. Een droom zonder actie is een nachtmerrie.

Score elke pijlar op een schaal van 1 (zwak) tot 5 (sterk) op basis van wat de gesprekken onthullen.
Bepaal richting op basis van hoe gesprekken zich over tijd ontwikkelen: worden ze dieper, concreter, meer gericht? Stijgend. Draaien ze in cirkels? Dalend. Geen duidelijke beweging? Stabiel.

Return ALLEEN een JSON-object, geen uitleg, geen markdown eromheen:
{
  "voortgang": "1-2 zinnen: worden de vragen dieper en concreter over tijd, of draaien ze in cirkels? Wees eerlijk.",
  "mindset_score": <getal 1 t/m 5>,
  "mindset_diagnose": "2-3 zinnen over de mindset die je ziet. Wat verraadt het taalgebruik, de vragen, de houding?",
  "mindset_richting": "stijgend",
  "systeem_score": <getal 1 t/m 5>,
  "systeem_diagnose": "2-3 zinnen over het systeemdenken. Zit er structuur in de vragen of is het elke keer ad hoc?",
  "systeem_richting": "stabiel",
  "actie_score": <getal 1 t/m 5>,
  "actie_diagnose": "2-3 zinnen over actiegericht gedrag. Hoe actief is iemand, worden vragen concreter over tijd?",
  "actie_richting": "stijgend",
  "ontwikkelpunten": [
    { "tekst": "Eerste concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "mindset" },
    { "tekst": "Tweede concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "systeem" },
    { "tekst": "Derde concrete ontwikkelpunt, één zin, direct en actiegericht", "pijlar": "actie" }
  ],
  "dringende_suggestie": "Één concrete actie die deze persoon NU kan uitvoeren — vandaag, dit uur. Niet 'bel morgen' of 'voor tien uur', maar wat gooit hij nu uit zijn handen? Een gesprek voeren, iets in zijn forecast bijwerken, een naam opschrijven, een bericht sturen. Baseer dit op wat de gesprekken en analyses onthullen als meest urgent. Wat is het één ding dat nu gedaan moet worden?",
  "dringende_suggestie_pijlar": "actie"
}

De richting-waarden mogen alleen zijn: "stijgend", "stabiel" of "dalend".
De pijlar-waarden mogen alleen zijn: "mindset", "systeem" of "actie".`,
    messages: [{
      role: 'user',
      content: `Analyseer deze ${sessions.length} gesprekken${analyses.length > 0 ? ` en ${analyses.length} eerder gemaakte patroonanalyses` : ''} en schrijf een coachingsdocument:${profielText}\n\nGESPREKKEN:\n${sessiesText}${analysesText}`
    }]
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''

  let parsed: {
    voortgang: string
    mindset_score: number
    mindset_diagnose: string
    mindset_richting: string
    systeem_score: number
    systeem_diagnose: string
    systeem_richting: string
    actie_score: number
    actie_diagnose: string
    actie_richting: string
    ontwikkelpunten: { tekst: string; pijlar: string }[]
    dringende_suggestie: string
    dringende_suggestie_pijlar: string
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return NextResponse.json({ error: 'parse_error' }, { status: 500 })
  }

  type Blog = { title: string; url: string; reden: string }
  const blogs: Blog[] = []
  try {
    // 3 parallelle RAG-queries — één per ontwikkelpunt voor precieze matching
    const ragResults = await Promise.all(
      parsed.ontwikkelpunten.map(p => getRelevantChunks(p.tekst, 8))
    )

    // Bouw een map van url → { title, chunks, punten }
    // Als een blog meerdere punten matcht, worden alle fragmenten en punten bewaard
    type BlogCandidate = { title: string; chunks: string[]; punten: string[] }
    const blogMap = new Map<string, BlogCandidate>()

    for (let i = 0; i < parsed.ontwikkelpunten.length; i++) {
      const punt = parsed.ontwikkelpunten[i].tekst
      for (const c of ragResults[i]) {
        if (!c.url || !c.source || !c.url.includes('arno.blog')) continue
        if (!blogMap.has(c.url)) {
          blogMap.set(c.url, {
            title: c.source.replace(/\s*\([^)]+\)\s*$/, ''),
            chunks: [c.content.slice(0, 400)],
            punten: [punt],
          })
        } else {
          const existing = blogMap.get(c.url)!
          if (!existing.punten.includes(punt)) {
            existing.punten.push(punt)
            existing.chunks.push(c.content.slice(0, 250))
          }
        }
        break // beste match per punt is voldoende
      }
    }

    const candidates = [...blogMap.entries()].slice(0, 3)

    if (candidates.length > 0) {
      // Kleine Claude-call voor synthese per blog op basis van echte fragmenten
      const synthContext = candidates.map(([url, b], i) =>
        `Blog ${i + 1}: "${b.title}" (${url})\nRelevant voor: ${b.punten.join(' + ')}\nFragment(en):\n${b.chunks.join('\n---\n')}`
      ).join('\n\n===\n\n')

      const synthResponse = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `Je bent Arno Diepeveen. Schrijf per blog één korte zin in gewone spreektaal die uitlegt wat iemand uit dit blog haalt. Geen formele taal, geen jargon, geen lange zinnen. Schrijf zoals je het aan een vriend uitlegt. Begin met "Hier leer je..." of "Dit legt uit hoe je..." of iets vergelijkbaars — kort, concreet, actiegericht.

Return ALLEEN een JSON array, geen uitleg eromheen:
[{ "url": "...", "reden": "..." }]`,
        messages: [{ role: 'user', content: synthContext }],
      })

      const synthRaw = synthResponse.content[0].type === 'text' ? synthResponse.content[0].text : ''
      const synthMatch = synthRaw.match(/\[[\s\S]*\]/)
      const synthParsed: { url: string; reden: string }[] = JSON.parse(synthMatch?.[0] ?? '[]')

      for (const [url, b] of candidates) {
        const synth = synthParsed.find(s => s.url === url)
        blogs.push({ title: b.title, url, reden: synth?.reden ?? '' })
      }
    }
  } catch {}

  const { dringende_suggestie: _ds, dringende_suggestie_pijlar: _dsp, ...coachingData } = parsed
  const doc = { ...coachingData, blogs, conversation_count: sessions.length }

  const { data: existing } = await supabase
    .from('arnobot_coaching')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  const saveResult = existing
    ? await supabase.from('arnobot_coaching').update(doc).eq('user_id', userId)
    : await supabase.from('arnobot_coaching').insert({ user_id: userId, ...doc })

  if (saveResult.error) console.error('[coaching POST save]', saveResult.error.message)

  return NextResponse.json({ coaching: doc })
}
