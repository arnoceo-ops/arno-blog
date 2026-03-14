// @ts-nocheck
import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font
} from '@react-pdf/renderer'

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface AnswerRow { question_id: string; answer: string; score?: number | null }
interface PdfProps {
  answers: AnswerRow[]
  healthScore: number
  kwaliteitsScore: number | null
  userName: string
  laatsteAnalyse: Date | null
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  cream: '#f0ede6',
  orange: '#EE7700',
  subtle: '#1e1e1e',
  muted: '#444',
  sand: '#f5f0e8',
  sandDark: '#1a1714',
}

const s = StyleSheet.create({
  // Pagina
  page: { backgroundColor: C.bg, padding: '48 56', fontFamily: 'Helvetica', color: C.cream },
  pageSand: { backgroundColor: C.sand, padding: '48 56', fontFamily: 'Helvetica', color: C.sandDark },

  // Cover
  coverLabel: { color: C.orange, fontSize: 8, letterSpacing: 4, marginBottom: 10, opacity: 0.7 },
  coverTitle: { fontSize: 72, letterSpacing: 4, color: C.cream, marginBottom: 8, lineHeight: 1, fontFamily: 'Helvetica-Bold' },
  coverSub: { color: C.cream, fontSize: 11, letterSpacing: 1, opacity: 0.35, marginBottom: 56 },
  coverDivider: { height: 1, backgroundColor: C.subtle, marginBottom: 40 },

  // Score blok
  scoreSection: { marginBottom: 32 },
  scoreLabel: { color: C.orange, fontSize: 8, letterSpacing: 4, marginBottom: 6 },
  scoreNumber: { fontSize: 64, letterSpacing: 2, color: C.cream, lineHeight: 1, marginBottom: 12, fontFamily: 'Helvetica-Bold' },
  scoreBar: { height: 2, backgroundColor: C.subtle, marginBottom: 4 },
  scoreBarFill: { height: 2, backgroundColor: C.orange },
  scoreMeta: { color: C.cream, fontSize: 8, letterSpacing: 2, opacity: 0.25 },

  // Sectiekaarten cover
  cardsRow: { flexDirection: 'row', gap: 2, marginTop: 40 },
  card: { flex: 1, padding: '24 20', backgroundColor: C.subtle, borderWidth: 1, borderColor: '#1e1e1e' },
  cardLabel: { color: C.orange, fontSize: 8, letterSpacing: 3, marginBottom: 8, opacity: 0.6 },
  cardTitle: { fontSize: 28, letterSpacing: 2, color: C.cream, marginBottom: 6, fontFamily: 'Helvetica-Bold' },
  cardMeta: { color: C.cream, fontSize: 9, opacity: 0.3, letterSpacing: 1 },
  cardBar: { height: 1, backgroundColor: '#333', marginTop: 16, marginBottom: 4 },
  cardBarFill: { height: 1, backgroundColor: C.orange },
  cardPct: { color: C.orange, fontSize: 8, letterSpacing: 2, opacity: 0.5 },

  // Content pagina's
  sectionHeader: { marginBottom: 32, borderBottomWidth: 1, borderBottomColor: '#1e1e1e', paddingBottom: 20 },
  sectionHeaderLabel: { color: C.orange, fontSize: 8, letterSpacing: 4, marginBottom: 6, opacity: 0.7 },
  sectionHeaderTitle: { fontSize: 48, letterSpacing: 3, color: C.cream, fontFamily: 'Helvetica-Bold', lineHeight: 1 },

  // Veld
  fieldBlock: { marginBottom: 20 },
  fieldLabel: { fontSize: 10, letterSpacing: 3, color: C.sandDark, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  fieldLabelDark: { fontSize: 10, letterSpacing: 3, color: C.cream, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  fieldSub: { fontSize: 8, color: C.sandDark, opacity: 0.5, marginBottom: 6, letterSpacing: 1 },
  fieldSubDark: { fontSize: 8, color: C.cream, opacity: 0.4, marginBottom: 6, letterSpacing: 1 },
  fieldValue: { fontSize: 10, color: C.sandDark, lineHeight: 1.7, fontFamily: 'Helvetica', borderBottomWidth: 1, borderBottomColor: '#d4cfc8', paddingBottom: 8 },
  fieldValueDark: { fontSize: 10, color: C.cream, lineHeight: 1.7, fontFamily: 'Helvetica', borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8 },
  fieldEmpty: { fontSize: 10, color: C.sandDark, opacity: 0.2, lineHeight: 1.7, borderBottomWidth: 1, borderBottomColor: '#d4cfc8', paddingBottom: 8, fontStyle: 'italic' },
  fieldEmptyDark: { fontSize: 10, color: C.cream, opacity: 0.2, lineHeight: 1.7, borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 8, fontStyle: 'italic' },

  // Grid layouts
  grid2: { flexDirection: 'row', gap: 32 },
  grid3: { flexDirection: 'row', gap: 24 },
  col: { flex: 1 },

  // Groep header
  groupHeader: { fontSize: 10, letterSpacing: 3, color: C.sandDark, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 20 },
  groupHeaderDark: { fontSize: 10, letterSpacing: 3, color: C.cream, fontFamily: 'Helvetica-Bold', marginBottom: 4, marginTop: 20 },
  groupSub: { fontSize: 8, color: C.sandDark, opacity: 0.5, letterSpacing: 1, marginBottom: 12 },

  // KPI tabel
  kpiRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#d4cfc8' },
  kpiLabel: { flex: 3, fontSize: 9, color: C.sandDark, letterSpacing: 1 },
  kpiDoel: { flex: 1, fontSize: 9, color: C.sandDark, opacity: 0.6, textAlign: 'right' },
  kpiReal: { flex: 1, fontSize: 9, color: C.sandDark, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // OKR tabel
  okrBlock: { borderWidth: 1, borderColor: '#d4cfc8', marginBottom: 12 },
  okrRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d4cfc8' },
  okrRowLast: { flexDirection: 'row' },
  okrCell: { flex: 1, padding: '8 10' },
  okrCellLabel: { fontSize: 7, letterSpacing: 2, color: C.sandDark, opacity: 0.5, marginBottom: 4 },
  okrCellValue: { fontSize: 9, color: C.sandDark, lineHeight: 1.6 },

  // Nummers tabel
  numbersRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  numberCell: { flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#d4cfc8' },
  numberLabel: { fontSize: 7, letterSpacing: 2, color: C.sandDark, opacity: 0.5, marginBottom: 4 },
  numberValue: { fontSize: 20, color: C.sandDark, fontFamily: 'Helvetica-Bold' },

  // Footer
  footer: { position: 'absolute', bottom: 32, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { color: C.cream, fontSize: 7, letterSpacing: 2, opacity: 0.2 },
  footerTextDark: { color: C.sandDark, fontSize: 7, letterSpacing: 2, opacity: 0.2 },
  pageNumber: { color: C.orange, fontSize: 8, letterSpacing: 2, opacity: 0.4 },

  // Divider
  divider: { height: 1, backgroundColor: '#1e1e1e', marginVertical: 24 },
  dividerSand: { height: 1, backgroundColor: '#d4cfc8', marginVertical: 20 },
  dividerOrange: { height: 1, backgroundColor: C.orange, marginVertical: 24 },
})

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function getAnswer(answers: AnswerRow[], prefix: string, id: string): string {
  const row = answers.find(r => r.question_id === `${prefix}_${id}`)
  return row?.answer?.trim() || ''
}

function pct(filled: number, total: number) {
  return total > 0 ? Math.round((filled / total) * 100) : 0
}

function countFilled(answers: AnswerRow[], prefix: string, ids: string[]): number {
  return ids.filter(id => getAnswer(answers, prefix, id).length > 0).length
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function Field({ label, sub, value, dark = false }: { label: string; sub?: string; value: string; dark?: boolean }) {
  return (
    <View style={s.fieldBlock}>
      <Text style={dark ? s.fieldLabelDark : s.fieldLabel}>{label}</Text>
      {sub ? <Text style={dark ? s.fieldSubDark : s.fieldSub}>{sub}</Text> : null}
      {value
        ? <Text style={dark ? s.fieldValueDark : s.fieldValue}>{value}</Text>
        : <Text style={dark ? s.fieldEmptyDark : s.fieldEmpty}>—</Text>
      }
    </View>
  )
}

function PageFooter({ label, page, dark = false }: { label: string; page: string; dark?: boolean }) {
  return (
    <View style={s.footer} fixed>
      <Text style={dark ? s.footerTextDark : s.footerText}>ROYAL DUTCH SALES — RDS CANVAS</Text>
      <Text style={dark ? s.footerTextDark : s.footerText}>{label}</Text>
      <Text style={s.pageNumber}>{page}</Text>
    </View>
  )
}

function SectionHeader({ pages, title, dark = false }: { pages: string; title: string; dark?: boolean }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderLabel}>{pages}</Text>
      <Text style={s.sectionHeaderTitle}>{title}</Text>
    </View>
  )
}

// ─── STRATEGIE PAGE 1 ────────────────────────────────────────────────────────
function StrategiePage1({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'strategie', id)
  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="01" title="STRATEGIE" />

      <View style={s.grid2}>
        <View style={s.col}>
          <Field label="MISSIE" sub="Reden van bestaan" value={g('missie')} />
        </View>
        <View style={s.col}>
          <Text style={s.groupHeader}>CULTUUR</Text>
          <Text style={s.groupSub}>DNA, kernwaarden en gedrag</Text>
          {[1,2,3,4,5].map(i => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <Text style={{ color: C.orange, fontSize: 8, opacity: 0.5, paddingTop: 3 }}>{i}</Text>
              <View style={{ flex: 1 }}>
                <Text style={g(`cultuur_${i}`) ? s.fieldValue : s.fieldEmpty}>
                  {g(`cultuur_${i}`) || '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={s.dividerSand} />

      <View style={s.grid3}>
        <View style={s.col}><Field label="WAARDEPROPOSITIE" sub="Welk voordeel bieden we?" value={g('waardepropositie')} /></View>
        <View style={s.col}><Field label="KERNCOMPETENTIES" sub="Waarin verschillen we van anderen?" value={g('kerncompetenties')} /></View>
        <View style={s.col}><Field label="DIENSTVERLENING" sub="Wat kopen klanten van ons?" value={g('dienstverlening')} /></View>
      </View>

      <View style={s.dividerSand} />

      <View style={s.grid3}>
        <View style={s.col}>
          <Field label="ZANDBAK" sub="Marktsegmenten / Niches / Kernklanten" value={g('zandbak')} />
        </View>
        <View style={s.col}>
          <Text style={s.groupHeader}>DOELEN 3–5 JR</Text>
          {[
            { id: 'doelen_datum', label: 'Datum' },
            { id: 'doelen_omzet', label: 'Omzet €' },
            { id: 'doelen_winst', label: 'Winst €' },
            { id: 'doelen_klanten', label: 'Klanten #' },
            { id: 'doelen_marktaandeel', label: 'Marktaandeel %' },
            { id: 'doelen_liquiditeit', label: 'Liquiditeit %' },
          ].map(f => (
            <View key={f.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#d4cfc8', paddingVertical: 5 }}>
              <Text style={{ fontSize: 8, color: C.sandDark, opacity: 0.5, letterSpacing: 1 }}>{f.label}</Text>
              <Text style={{ fontSize: 9, color: C.sandDark, fontFamily: 'Helvetica-Bold' }}>{g(f.id) || '—'}</Text>
            </View>
          ))}
        </View>
        <View style={s.col}>
          <Text style={s.groupHeader}>ACTIES 1 JR</Text>
          {[
            { id: 'acties_datum', label: 'Datum' },
            { id: 'acties_omzet', label: 'Omzet €' },
            { id: 'acties_winst', label: 'Winst €' },
            { id: 'acties_brutomarge', label: 'Brutomarge %' },
            { id: 'acties_cash', label: 'Cash €' },
            { id: 'acties_klanten', label: 'Klanten #' },
          ].map(f => (
            <View key={f.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#d4cfc8', paddingVertical: 5 }}>
              <Text style={{ fontSize: 8, color: C.sandDark, opacity: 0.5, letterSpacing: 1 }}>{f.label}</Text>
              <Text style={{ fontSize: 9, color: C.sandDark, fontFamily: 'Helvetica-Bold' }}>{g(f.id) || '—'}</Text>
            </View>
          ))}
        </View>
      </View>

      <PageFooter label="STRATEGIE" page="01" dark />
    </Page>
  )
}

// ─── STRATEGIE PAGE 2 ────────────────────────────────────────────────────────
function StrategiePage2({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'strategie', id)
  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="02" title="STRATEGIE" />

      <View style={[s.grid2, { marginBottom: 20 }]}>
        <View style={s.col}><Field label="LEIDERSCHAP" sub="Welke markt(en) willen we domineren?" value={g('leiderschap_markten')} /></View>
        <View style={s.col}><Field label="WANNEER?" sub="" value={g('leiderschap_wanneer')} /></View>
      </View>

      <View style={[{ borderTopWidth: 2, borderTopColor: C.orange, paddingTop: 20, marginBottom: 20 }]}>
        <View style={s.grid3}>
          <View style={s.col}><Field label="MERKBELOFTE" sub="Unieke merkbeloftes en garanties" value={g('merkbelofte')} /></View>
          <View style={s.col}><Field label="STRATEGIE IN 1 ZIN" sub="Hoe onderscheiden we ons?" value={g('strategie_1_zin')} /></View>
          <View style={s.col}>
            <Text style={s.groupHeader}>ONDERSCHEIDEND VERMOGEN</Text>
            <Text style={s.groupSub}>Kernactiviteiten die de strategie ondersteunen</Text>
            {[1,2,3,4,5].map(i => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <Text style={{ color: C.orange, fontSize: 8, opacity: 0.5, paddingTop: 2 }}>{i}</Text>
                <Text style={g(`onderscheidend_${i}`) ? { ...s.fieldValue, flex: 1 } : { ...s.fieldEmpty, flex: 1 }}>
                  {g(`onderscheidend_${i}`) || '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.dividerSand} />

      <View style={s.grid3}>
        <View style={s.col}><Field label="X-FACTOR" sub="10X meerwaarde" value={g('xfactor')} /></View>
        <View style={s.col}><Field label="WINST PER EENHEID" sub="Economische motor" value={g('winst_per_eenheid')} /></View>
        <View style={s.col}><Field label="MOONSHOTS" sub="+1000%" value={g('moonshots')} /></View>
      </View>

      <View style={s.dividerSand} />

      <Field label="SCHAALBAARHEID" sub="Hoe maken we onze dienstverlening schaalbaar?" value={g('schaalbaarheid')} />

      <View style={s.grid3}>
        <View style={s.col}><Field label="REPETERENDE OMZET" sub="Hoe blijven we klanten aan ons binden?" value={g('repeterende_omzet')} /></View>
        <View style={s.col}><Field label="KLANTRETENTIE" sub="Hoe leveren we continue waarde?" value={g('klantretentie')} /></View>
        <View style={s.col}><Field label="REFERRALS" sub="Hoe maken we ambassadeurs?" value={g('referrals')} /></View>
      </View>

      <View style={[s.dividerSand, { marginTop: 8 }]} />
      <Field label="OMTM" sub="Belangrijkste prestatie-indicator" value={g('omtm')} />

      <PageFooter label="STRATEGIE" page="02" dark />
    </Page>
  )
}

// ─── MENSEN PAGE 1 ───────────────────────────────────────────────────────────
function MensenPage1({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'mensen', id)
  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="03" title="MENSEN" />

      <View style={s.grid2}>
        <View style={s.col}><Field label="AANTREKKINGSKRACHT" sub="Waarom werken mensen voor ons?" value={g('aantrekkingskracht')} /></View>
        <View style={s.col}><Field label="PROFIELEN" sub="Welke salesprofielen hebben we nodig?" value={g('profielen')} /></View>
      </View>

      <View style={s.dividerSand} />

      <View style={s.grid3}>
        <View style={s.col}><Field label="WERVINGSKANALEN" sub="Via welke kanalen vinden we toptalent?" value={g('wervingskanalen')} /></View>
        <View style={s.col}><Field label="SELECTIEPROCES" sub="Hoe krijgen we toptalent aan boord?" value={g('selectieproces')} /></View>
        <View style={s.col}><Field label="BEHOUD STERSPELERS" sub="Hoe houden we sterspelers?" value={g('behoud_sterspelers')} /></View>
      </View>

      <View style={s.dividerSand} />

      <Text style={s.groupHeader}>BENODIGDE CAPACITEIT</Text>
      <Text style={s.groupSub}>Hoeveel verkopers hebben we nodig om het jaardoel te halen?</Text>

      <View style={s.grid2}>
        {['q1','q2','q3','q4'].map((q, qi) => (
          <View key={q} style={[s.col, qi % 2 === 0 ? { marginBottom: 16 } : {}]}>
            <Text style={{ fontSize: 10, letterSpacing: 2, color: C.sandDark, fontFamily: 'Helvetica-Bold', marginBottom: 8 }}>{q.toUpperCase()}</Text>
            {[
              { id: `verkopers_${q}_aantal`, label: '# verkopers' },
              { id: `verkopers_${q}_blijven`, label: '# die blijven' },
              { id: `verkopers_${q}_uitbreiding`, label: '# uitbreiding' },
              { id: `verkopers_${q}_nieuw`, label: '# nieuwe sales' },
            ].map(row => (
              <View key={row.id} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#d4cfc8', paddingVertical: 4 }}>
                <Text style={{ fontSize: 8, color: C.sandDark, opacity: 0.5, letterSpacing: 1 }}>{row.label}</Text>
                <Text style={{ fontSize: 9, color: C.sandDark, fontFamily: 'Helvetica-Bold' }}>{g(row.id) || '—'}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <PageFooter label="MENSEN" page="03" dark />
    </Page>
  )
}

// ─── MENSEN PAGE 2 ───────────────────────────────────────────────────────────
function MensenPage2({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'mensen', id)
  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="04" title="MENSEN" />

      <View style={s.grid3}>
        <View style={s.col}><Field label="WERVING & SELECTIE" sub="Doorlooptijd vacature tot eerste werkdag" value={g('werving_selectie')} /></View>
        <View style={s.col}><Field label="ONBOARDING" sub="Maanden tot 100% doelstelling" value={g('onboarding')} /></View>
        <View style={s.col}><Field label="TIJD TOT VOLLEDIG RENDEMENT" sub="Van vacature tot 100% doelstelling" value={g('tijd_rendement')} /></View>
      </View>

      <View style={s.dividerSand} />

      <Field label="ACTIEPLAN" sub="" value={g('actieplan')} />

      <PageFooter label="MENSEN" page="04" dark />
    </Page>
  )
}

// ─── UITVOERING PAGE 1 ───────────────────────────────────────────────────────
function UitvoeringPage1({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'uitvoering', id)
  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="05" title="UITVOERING" />

      {/* Kwartaal info */}
      <View style={[s.grid2, { marginBottom: 20 }]}>
        <View style={s.col}>
          <View style={{ flexDirection: 'row', gap: 32 }}>
            <View>
              <Text style={s.fieldLabel}>KWARTAAL / JAAR</Text>
              <Text style={g('kwartaal_jaar') ? s.fieldValue : s.fieldEmpty}>{g('kwartaal_jaar') || '—'}</Text>
            </View>
            <View>
              <Text style={s.fieldLabel}>THEMANAAM</Text>
              <Text style={g('themanaam') ? s.fieldValue : s.fieldEmpty}>{g('themanaam') || '—'}</Text>
            </View>
          </View>
        </View>
        <View style={s.col}>
          <View style={{ flexDirection: 'row', gap: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>MEETBAAR DOEL</Text>
              <Text style={g('meetbaar_doel') ? s.fieldValue : s.fieldEmpty}>{g('meetbaar_doel') || '—'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>CRUCIALE KPI</Text>
              <Text style={g('cruciale_kpi') ? s.fieldValue : s.fieldEmpty}>{g('cruciale_kpi') || '—'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={s.dividerSand} />

      {/* OKR Tabel */}
      <Text style={s.groupHeader}>OKR — OBJECTIVES & KEY RESULTS</Text>
      <View style={{ marginBottom: 16 }}>
        {[1,2,3].map(n => (
          <View key={n} style={{ borderWidth: 1, borderColor: '#d4cfc8', marginBottom: 8 }}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#d4cfc8', backgroundColor: '#ede8df', padding: '6 10' }}>
              <Text style={{ fontSize: 8, letterSpacing: 2, color: C.sandDark, opacity: 0.5 }}>OKR {n}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 2, padding: '8 10', borderRightWidth: 1, borderRightColor: '#d4cfc8' }}>
                <Text style={{ fontSize: 7, letterSpacing: 2, color: C.sandDark, opacity: 0.5, marginBottom: 4 }}>DOELSTELLING (WAT)</Text>
                <Text style={{ fontSize: 9, color: C.sandDark, lineHeight: 1.6 }}>{g(`okr_wat_${n}`) || '—'}</Text>
              </View>
              <View style={{ flex: 2, padding: '8 10', borderRightWidth: 1, borderRightColor: '#d4cfc8' }}>
                <Text style={{ fontSize: 7, letterSpacing: 2, color: C.sandDark, opacity: 0.5, marginBottom: 4 }}>KERNRESULTAAT (HOE)</Text>
                <Text style={{ fontSize: 9, color: C.sandDark, lineHeight: 1.6 }}>{g(`okr_hoe_${n}`) || '—'}</Text>
              </View>
              <View style={{ flex: 1, padding: '8 10' }}>
                <Text style={{ fontSize: 7, letterSpacing: 2, color: C.sandDark, opacity: 0.5, marginBottom: 4 }}>OWNER</Text>
                <Text style={{ fontSize: 9, color: C.sandDark }}>{g(`okr_wie_${n}`) || '—'}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Klanten */}
      <View style={s.grid3}>
        {[
          { key: 'krijgen', label: 'KLANTEN KRIJGEN', sub: 'Effectieve leadgeneratie' },
          { key: 'uitbouwen', label: 'KLANTEN UITBOUWEN', sub: '100% klantaandeel' },
          { key: 'houden', label: 'KLANTEN BEHOUDEN', sub: 'Levenslange retentie' },
        ].map(({ key, label, sub }) => (
          <View key={key} style={s.col}>
            <Text style={s.groupHeader}>{label}</Text>
            <Text style={s.groupSub}>{sub}</Text>
            {[1,2,3].map(n => (
              <View key={n} style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                <Text style={{ color: C.orange, fontSize: 8, opacity: 0.5, paddingTop: 2 }}>{n}</Text>
                <Text style={{ fontSize: 9, color: C.sandDark, lineHeight: 1.5, flex: 1 }}>
                  {g(`klanten_${key}_${n}`) || '—'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <PageFooter label="UITVOERING" page="05" dark />
    </Page>
  )
}

// ─── UITVOERING PAGE 2 ───────────────────────────────────────────────────────
function UitvoeringPage2({ answers }: { answers: AnswerRow[] }) {
  const g = (id: string) => getAnswer(answers, 'uitvoering', id)
  const kpiFields = [
    { id: 'kpi_verkoopcyclus', label: 'Verkoopcyclus (Doorlooptijd)' },
    { id: 'kpi_conversieratio', label: '% Target behaald' },
    { id: 'kpi_klantaandeel', label: '% Klantaandeel' },
    { id: 'kpi_klantretentie', label: '% Klantretentie' },
    { id: 'kpi_forecast', label: '% Behaalde Forecast' },
    { id: 'kpi_ordergrootte', label: '€ Gem. Ordergrootte' },
    { id: 'kpi_nieuwe_logos', label: "# Nieuwe Logo's" },
    { id: 'kpi_omzet', label: '€ Omzet' },
    { id: 'kpi_winst', label: '€/% Winst' },
    { id: 'kpi_referrals', label: '# Referrals' },
  ]

  return (
    <Page size="A4" style={s.pageSand}>
      <SectionHeader pages="06" title="UITVOERING" />

      {/* Aantallen & conversies */}
      <Text style={s.groupHeader}>AANTALLEN & CONVERSIES</Text>
      <View style={[s.numbersRow, { marginBottom: 16 }]}>
        {['numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals'].map(id => (
          <View key={id} style={s.numberCell}>
            <Text style={s.numberLabel}>{id.replace('numbers_','').toUpperCase()}</Text>
            <Text style={s.numberValue}>{g(id) || '—'}</Text>
          </View>
        ))}
      </View>

      <View style={s.dividerSand} />

      {/* KPI Dashboard */}
      <Text style={s.groupHeader}>KPI DASHBOARD</Text>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        <Text style={{ flex: 3, fontSize: 7, color: C.sandDark, opacity: 0.4, letterSpacing: 2 }}>KPI</Text>
        <Text style={{ flex: 1, fontSize: 7, color: C.sandDark, opacity: 0.4, letterSpacing: 2, textAlign: 'right' }}>DOEL</Text>
        <Text style={{ flex: 1, fontSize: 7, color: C.sandDark, opacity: 0.4, letterSpacing: 2, textAlign: 'right' }}>REALISATIE</Text>
      </View>
      {kpiFields.map(({ id, label }) => (
        <View key={id} style={s.kpiRow}>
          <Text style={s.kpiLabel}>{label}</Text>
          <Text style={s.kpiDoel}>{g(`${id}_doel`) || '—'}</Text>
          <Text style={s.kpiReal}>{g(`${id}_real`) || g(id) || '—'}</Text>
        </View>
      ))}

      <View style={s.dividerSand} />

      <Field label="WENSENLIJST" sub="Nieuwe Logo's (Olifanten)" value={g('wensenlijst')} />
      <Field label="VERKOOPPROCES / KLANTREIS" sub="Hoe ziet ons verkoopproces en klantreis er uit?" value={g('verkoopproces')} />

      <View style={s.grid2}>
        <View style={s.col}><Field label="BOUW EEN FEESTJE" sub="Hoe vieren we onze successen?" value={g('feestje')} /></View>
        <View style={s.col}><Field label="BELONING" sub="Hoe belonen we betrokken medewerkers?" value={g('beloning')} /></View>
      </View>

      <PageFooter label="UITVOERING" page="06" dark />
    </Page>
  )
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
function CoverPage({ answers, healthScore, kwaliteitsScore, userName, laatsteAnalyse }: PdfProps) {
  const STRATEGIE_FIELDS = ['missie','cultuur_1','cultuur_2','cultuur_3','cultuur_4','cultuur_5','waardepropositie','kerncompetenties','dienstverlening','zandbak','doelen_datum','doelen_omzet','doelen_winst','doelen_klanten','doelen_marktaandeel','doelen_liquiditeit','acties_datum','acties_omzet','acties_winst','acties_brutomarge','acties_cash','acties_klanten','leiderschap_markten','leiderschap_wanneer','merkbelofte','strategie_1_zin','onderscheidend_1','onderscheidend_2','onderscheidend_3','onderscheidend_4','onderscheidend_5','xfactor','winst_per_eenheid','moonshots','schaalbaarheid','repeterende_omzet','klantretentie','referrals','omtm']
  const MENSEN_FIELDS = ['aantrekkingskracht','profielen','wervingskanalen','selectieproces','behoud_sterspelers','verkopers_q1','verkopers_q2','verkopers_q3','verkopers_q4','werving_selectie','onboarding','tijd_rendement','actieplan']
  const UITVOERING_FIELDS = ['kwartaal_jaar','themanaam','meetbaar_doel','cruciale_kpi','okr_wat_1','okr_hoe_1','okr_wie_1','okr_wat_2','okr_hoe_2','okr_wie_2','okr_wat_3','okr_hoe_3','okr_wie_3','klanten_krijgen_1','klanten_krijgen_2','klanten_krijgen_3','klanten_uitbouwen_1','klanten_uitbouwen_2','klanten_uitbouwen_3','klanten_houden_1','klanten_houden_2','klanten_houden_3','numbers_leads','numbers_bezoeken','numbers_offertes','numbers_orders','numbers_referrals','wensenlijst','kpi_verkoopcyclus','kpi_omzet','kpi_winst','verkoopproces','feestje','beloning']

  const sScores = [
    { key: 'strategie', label: 'STRATEGIE', pages: '01 — 02', fields: STRATEGIE_FIELDS, filled: countFilled(answers, 'strategie', STRATEGIE_FIELDS) },
    { key: 'mensen', label: 'MENSEN', pages: '03 — 04', fields: MENSEN_FIELDS, filled: countFilled(answers, 'mensen', MENSEN_FIELDS) },
    { key: 'uitvoering', label: 'UITVOERING', pages: '05 — 06', fields: UITVOERING_FIELDS, filled: countFilled(answers, 'uitvoering', UITVOERING_FIELDS) },
  ]

  return (
    <Page size="A4" style={s.page}>
      <View style={{ marginBottom: 64 }}>
        <Text style={s.coverLabel}>ROYAL DUTCH SALES</Text>
        <Text style={s.coverTitle}>RDS{'\n'}CANVAS</Text>
        <Text style={s.coverSub}>{userName} — Verkoopplan {new Date().getFullYear()}</Text>
      </View>

      <View style={s.coverDivider} />

      {/* Volledigheid */}
      <View style={s.scoreSection}>
        <Text style={s.scoreLabel}>VOLLEDIGHEID</Text>
        <Text style={s.scoreNumber}>{healthScore}%</Text>
        <View style={s.scoreBar}>
          <View style={[s.scoreBarFill, { width: `${healthScore}%` }]} />
        </View>
      </View>

      {/* Plan Kwaliteit */}
      <View style={[s.scoreSection, { paddingTop: 24, borderTopWidth: 1, borderTopColor: C.subtle }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={s.scoreLabel}>PLAN KWALITEIT</Text>
          <Text style={{ color: C.cream, fontSize: 7, letterSpacing: 2, opacity: 0.2 }}>MENSEN 40% · STRATEGIE 30% · UITVOERING 30%</Text>
        </View>
        <Text style={[s.scoreNumber, { color: kwaliteitsScore !== null ? C.cream : C.muted }]}>
          {kwaliteitsScore !== null ? `${kwaliteitsScore}%` : '—'}
        </Text>
        {kwaliteitsScore !== null && (
          <View style={s.scoreBar}>
            <View style={[s.scoreBarFill, { width: `${kwaliteitsScore}%` }]} />
          </View>
        )}
        {laatsteAnalyse && (
          <Text style={[s.scoreMeta, { marginTop: 6 }]}>
            LAATSTE ANALYSE: {formatDate(laatsteAnalyse)}
          </Text>
        )}
      </View>

      {/* Sectiekaarten */}
      <View style={s.cardsRow}>
        {sScores.map(sec => {
          const p = pct(sec.filled, sec.fields.length)
          return (
            <View key={sec.key} style={s.card}>
              <Text style={s.cardLabel}>{sec.pages}</Text>
              <Text style={s.cardTitle}>{sec.label}</Text>
              <Text style={s.cardMeta}>{sec.filled} / {sec.fields.length} velden</Text>
              <View style={s.cardBar}>
                <View style={[s.cardBarFill, { width: `${p}%` }]} />
              </View>
              <Text style={s.cardPct}>{p}%</Text>
            </View>
          )
        })}
      </View>

      <PageFooter label="COVER" page="" />
    </Page>
  )
}

// ─── MAIN DOCUMENT ───────────────────────────────────────────────────────────
export function CanvasPdfDocument({ answers, healthScore, kwaliteitsScore, userName, laatsteAnalyse }: PdfProps) {
  return (
    <Document
      title={`RDS Canvas — ${userName}`}
      author="Royal Dutch Sales"
      subject="Verkoopplan"
    >
      <CoverPage answers={answers} healthScore={healthScore} kwaliteitsScore={kwaliteitsScore} userName={userName} laatsteAnalyse={laatsteAnalyse} />
      <StrategiePage1 answers={answers} />
      <StrategiePage2 answers={answers} />
      <MensenPage1 answers={answers} />
      <MensenPage2 answers={answers} />
      <UitvoeringPage1 answers={answers} />
      <UitvoeringPage2 answers={answers} />
    </Document>
  )
}
