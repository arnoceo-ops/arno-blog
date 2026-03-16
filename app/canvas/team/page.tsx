'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

import Link from 'next/link';

const SEGMENT_WEIGHTS = { mensen: 0.4, strategie: 0.3, uitvoering: 0.3 };
const SEGMENT_TOTALS  = { strategie: 39, mensen: 13, uitvoering: 44 };

const G  = 'Geist, system-ui, sans-serif';
const BN = 'Bebas Neue, sans-serif';

const ORANGE = '#EE7700';
const GREY   = 'rgb(136, 136, 136)';
const CREAM  = '#f0ede6';
const DARK   = '#0a0a0a';
const CARD   = '#0d0d0d';
const LINE   = '#1f1f1f';
const LINE2  = '#1a1a1a';

const RED    = '#c0392b';
const YELLOW = '#d4a017';
const GREEN  = '#2ecc71';

interface MemberStats {
  user_id: string;
  email: string;
  strategie_kwaliteit: number;
  mensen_kwaliteit: number;
  uitvoering_kwaliteit: number;
  plan_kwaliteit: number;
  strategie_voortgang: number;
  mensen_voortgang: number;
  uitvoering_voortgang: number;
  volledigheid: number;
}

interface QuestionAlignment {
  question_id: string;
  label: string;
  score: number;
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
  summary?: string;
}

/* ── Alignment colour helper ── */
function alignColor(pct: number) {
  if (pct >= 70) return GREEN;
  if (pct >= 45) return YELLOW;
  return RED;
}

function alignLabel(pct: number) {
  if (pct >= 70) return 'ALIGNED';
  if (pct >= 45) return 'MATIG';
  return 'DIVERGENT';
}

/* ── Single row: label + bar + percentage ── */
function Row({ label, value, barColor }: { label: string; value: number; barColor: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: GREY }}>{label}</span>
        <span style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: CREAM }}>{value}%</span>
      </div>
      <div style={{ height: 2, background: LINE2 }}>
        <div style={{ height: '100%', width: `${value}%`, background: barColor, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}


/* ── ArnoBot Alignment Chat — B ── */
function AlignmentChat({ result }: { result: AlignmentResult }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const context = `Team alignment resultaten:
Overall: ${result.overall}%
Strategie: ${result.strategie}% | Mensen: ${result.mensen}% | Uitvoering: ${result.uitvoering}%
Diagnose: ${result.summary ?? ''}
Vraag analyse: ${result.questions.slice(0, 5).map(q => q.label + ': ' + q.diagnose).join(' | ')}`;

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setThinking(true);
    try {
      const res = await fetch('/api/canvas/alignment-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply ?? 'Geen antwoord.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Fout bij verbinding met ArnoBot.' }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div style={{ margin: '2px 40px 2px', background: '#0d0d0d', border: `0.5px solid ${LINE}` }}>
      <div style={{ padding: '20px 28px 16px', borderBottom: `1px solid ${LINE2}` }}>
        <div style={{ fontFamily: G, fontSize: 11, color: GREY, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>STEL EEN VRAAG</div>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div style={{ padding: '20px 28px', maxHeight: 320, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: m.role === 'user' ? ORANGE : '#1a1a1a',
              padding: '10px 16px',
            }}>
              <div style={{ fontFamily: G, fontSize: 13, color: m.role === 'user' ? DARK : CREAM, lineHeight: 1.5 }}>{m.text}</div>
            </div>
          ))}
          {thinking && (
            <div style={{ alignSelf: 'flex-start', background: '#1a1a1a', padding: '10px 16px' }}>
              <div style={{ fontFamily: G, fontSize: 13, color: GREY }}>ArnoBot denkt na...</div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '16px 28px 20px', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Wat kan ik doen met de divergentie op waardepropositie?"
          style={{
            flex: 1,
            maxWidth: 600,
            fontFamily: G,
            fontSize: 13,
            color: CREAM,
            background: '#111',
            border: `1px solid ${LINE}`,
            padding: '10px 16px',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          disabled={thinking || !input.trim()}
          style={{
            fontFamily: BN,
            fontSize: 18,
            letterSpacing: '0.08em',
            color: DARK,
            background: thinking ? LINE : ORANGE,
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            width: 200,
            cursor: thinking ? 'not-allowed' : 'pointer',
          }}
        >
          STUUR
        </button>
      </div>
    </div>
  );
}



/* ── PDF Download ── */
function downloadAlignmentPDF(result: AlignmentResult) {
  import('jspdf').then(({ jsPDF }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 20;
  let y = 20;

  const addText = (text: string, x: number, size: number, bold = false, color = [240, 237, 230] as [number,number,number]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  const newLine = (h = 8) => { y += h; };

  // Background
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, W, 297, 'F');

  // Title
  doc.setFontSize(28);
  doc.setTextColor(240, 237, 230);
  doc.text('TEAM ALIGNMENT RAPPORT', margin, y);
  newLine(8);
  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text(`Gegenereerd op ${new Date(result.calculated_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
  newLine(14);

  // Overall scores
  doc.setFontSize(48);
  doc.setTextColor(238, 119, 0);
  doc.text(`${result.overall}%`, margin, y);
  newLine(10);
  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text(`STRATEGIE: ${result.strategie}%   MENSEN: ${result.mensen}%   UITVOERING: ${result.uitvoering}%`, margin, y);
  newLine(6);
  if (result.summary) {
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const summaryLines = doc.splitTextToSize(result.summary, W - margin * 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5;
  }
  newLine(10);

  // Orange line
  doc.setDrawColor(238, 119, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  newLine(10);

  // Section: prioriteiten
  const segments = ['strategie', 'mensen', 'uitvoering'];
  const segLabels: Record<string, string> = { strategie: 'STRATEGIE', mensen: 'MENSEN', uitvoering: 'UITVOERING' };

  for (const seg of segments) {
    const segQuestions = [...result.questions]
      .filter(q => q.segment === seg)
      .sort((a, b) => a.score - b.score);
    if (!segQuestions.length) continue;

    if (y > 260) { doc.addPage(); doc.setFillColor(10,10,10); doc.rect(0,0,W,297,'F'); y = 20; }

    doc.setFontSize(16);
    doc.setTextColor(238, 119, 0);
    doc.text(segLabels[seg], margin, y);
    newLine(8);

    for (const q of segQuestions) {
      if (y > 270) { doc.addPage(); doc.setFillColor(10,10,10); doc.rect(0,0,W,297,'F'); y = 20; }
      const pct = Math.round(((q.score - 1) / 4) * 100);
      const r = pct < 45 ? 192 : pct < 70 ? 212 : 46;
      const g = pct < 45 ? 57 : pct < 70 ? 160 : 204;
      const b = pct < 45 ? 43 : pct < 70 ? 23 : 113;
      doc.setFontSize(9);
      doc.setTextColor(r, g, b);
      doc.text(`${pct}%`, margin, y);
      doc.setTextColor(240, 237, 230);
      const labelLines = doc.splitTextToSize(q.label, W - margin * 2 - 20);
      doc.text(labelLines, margin + 18, y);
      y += labelLines.length * 5;
      doc.setTextColor(136, 136, 136);
      const diagnoseLines = doc.splitTextToSize(q.diagnose, W - margin * 2 - 18);
      doc.text(diagnoseLines, margin + 18, y);
      y += diagnoseLines.length * 5 + 3;
    }
    newLine(6);
  }

  doc.save('alignment-rapport.pdf');
  });
}

/* ── Alignment Score Section ── */
function AlignmentScore({
  members,
  token,
}: {
  members: MemberStats[];
  token: string | null;
}) {
  const [result,    setResult]    = useState<AlignmentResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [loadingCached, setLoadingCached] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Load cached result on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/canvas/alignment', {
          headers: { 'x-supabase-token': token },
        });
        const data = await res.json();
        if (data.cached) setResult(data.cached);
      } catch { /* no cache */ }
      finally { setLoadingCached(false); }
    })();
  }, [token]);

  const analyse = useCallback(async () => {
    if (!token || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/canvas/alignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analyse mislukt');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, loading]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ borderBottom: `1px solid ${LINE}` }}>

      {/* Section header */}
      <div style={{ padding: '40px 40px 32px', borderBottom: `1px solid ${LINE2}` }}>
        <h2 style={{ fontFamily: BN, fontSize: 'clamp(32px,4vw,56px)' as any, fontWeight: 400, color: CREAM, margin: 0, letterSpacing: '0.02em' }}>
          ALIGNMENT ANALYSE
        </h2>
        {result && (
          <div style={{ fontFamily: G, fontSize: 11, color: GREY, marginTop: 6 }}>
            Laatste analyse: {formatDate(result.calculated_at)}
          </div>
        )}
        <button
          onClick={analyse}
          disabled={loading || members.length < 2}
          style={{
            fontFamily: BN,
            fontSize: 18,
            letterSpacing: '0.08em',
            color: loading ? GREY : DARK,
            background: loading ? LINE : ORANGE,
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            width: 200,
            marginTop: 20,
            cursor: loading || members.length < 2 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: members.length < 2 ? 0.4 : 1,
          }}
        >
          {loading ? 'ANALYSEREN...' : result ? 'HERBEREKEN' : 'ANALYSEER TEAM'}
        </button>
      </div>

      {/* Loading state */}
      {loadingCached && (
        <div style={{ padding: '48px 40px', fontFamily: G, fontSize: 13, color: GREY }}>Laden...</div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '24px 40px', fontFamily: G, fontSize: 13, color: RED }}>{error}</div>
      )}

      {/* No result yet */}
      {!loadingCached && !result && !error && (
        <div style={{ padding: '48px 40px' }}>
          <div style={{ fontFamily: G, fontSize: 13, color: GREY, maxWidth: 480 }}>
            Klik op "Analyseer Team" om de mate van alignment tussen teamleden te berekenen.
            ArnoBot analyseert de antwoorden per vraag en bepaalt waar het team op één lijn zit
            en waar de meningen uiteenlopen.
          </div>
          {members.length < 2 && (
            <div style={{ fontFamily: G, fontSize: 12, color: YELLOW, marginTop: 12 }}>
              ⚠ Minimaal 2 teamleden met ingevulde antwoorden nodig.
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && !loadingCached && (
        <div>
          {/* Overall + segment scores */}
          <div style={{ padding: '40px 40px 48px', borderBottom: `1px solid ${LINE2}`, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 80px', alignItems: 'center' }}>

            {/* Big score */}
            <div style={{ textAlign: 'center' as const }}>
              <div style={{ fontFamily: BN, fontSize: 'clamp(80px,12vw,160px)' as any, fontWeight: 400, lineHeight: 1, color: alignColor(result.overall) }}>
                {result.overall}%
              </div>
              <div style={{ fontFamily: G, fontSize: 11, letterSpacing: '0.12em', color: alignColor(result.overall), marginTop: 4 }}>
                TEAM {alignLabel(result.overall)}
              </div>
            </div>

            {/* Segment bars */}
            <div style={{ maxWidth: 480 }}>
              <div style={{ marginBottom: 28 }}>
                <Row label="STRATEGIE"  value={result.strategie}  barColor={alignColor(result.strategie)} />
                <Row label="MENSEN"     value={result.mensen}     barColor={alignColor(result.mensen)} />
                <Row label="UITVOERING" value={result.uitvoering} barColor={alignColor(result.uitvoering)} />
              </div>
              <div style={{ fontFamily: G, fontSize: 11, color: GREY, lineHeight: 1.6 }}>
                Gewogen score (Mensen 40%, Strategie 30%, Uitvoering 30%).
                Groen ≥70% · Oranje 45–69% · Rood &lt;45%
              </div>
            </div>
          </div>

                     {/* ArnoBot + ArnoLive — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

            {/* ArnoBot — A+B */}
            <div style={{ background: '#0d0d0d', border: `0.5px solid ${LINE}` }}>
              <div style={{ padding: '28px 40px 20px', borderBottom: `1px solid ${LINE2}` }}>
                <div style={{ fontFamily: BN, fontSize: 56, fontWeight: 400, color: CREAM, letterSpacing: '0.02em', lineHeight: 1 }}>ARNOBOT</div>
                <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: GREY, marginTop: 6 }}>ADVIES VAN ARNOBOT</div>
              </div>
              {result.summary && (
                <div style={{ padding: '20px 40px 24px', borderBottom: `1px solid ${LINE2}` }}>
                  <div style={{ fontFamily: G, fontSize: 13, color: CREAM, lineHeight: 1.6, fontStyle: 'italic' as const }}>{result.summary}</div>
                </div>
              )}
              <AlignmentChat result={result} />
            </div>

            {/* ArnoLive — C */}
            <div style={{ background: '#0d0d0d', border: `0.5px solid ${LINE}`, display: 'flex', flexDirection: 'column' as const }}>
              <div style={{ padding: '28px 40px 20px', borderBottom: `1px solid ${LINE2}` }}>
                <div style={{ fontFamily: BN, fontSize: 56, fontWeight: 400, color: CREAM, letterSpacing: '0.02em', lineHeight: 1 }}>ARNOLIVE</div>
                <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: GREY, marginTop: 6 }}>ADVIES VAN ARNOLIVE</div>
              </div>
              <div style={{ padding: '20px 40px 24px', borderBottom: `1px solid ${LINE2}` }}>
                <div style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                  ARNO LIVE IN STELLING BRENGEN?
                </div>
              </div>
              <div style={{ padding: '16px 40px 20px' }}>
                <a
                  href="mailto:arno@royaldutchsales.com?subject=ArnoLive%20aanvraag&amp;body=Ik%20wil%20graag%20de%20alignment%20resultaten%20bespreken."
                  style={{ fontFamily: BN, fontSize: 18, letterSpacing: '0.08em', color: DARK, background: ORANGE, padding: '12px 0', borderRadius: 8, width: 200, textDecoration: 'none', display: 'inline-block', textAlign: 'center' as const }}
                >
                  BOEK ARNOLIVE
                </a>
              </div>
            </div>
          </div>


          {/* Question breakdown — top 5 best + top 5 worst */}
          {result.questions.length > 0 && (<>
            <div style={{ height: 2, background: '#EE7700', margin: '2px 0' }} />
            <div style={{ padding: '32px 40px 40px' }}>

              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: G, fontSize: 11, fontWeight: 400, letterSpacing: '0.08em', color: GREY, textTransform: 'uppercase' as const }}>
                  VRAAG ANALYSE — {result.questions.length} VRAGEN GEANALYSEERD
                </div>
              </div>

              {/* Top 5 worst aligned */}
              <div style={{ fontFamily: G, fontSize: 11, color: GREY, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
                AANDACHTSPUNTEN — LAAGSTE ALIGNMENT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 2, marginBottom: 32 }}>
                {result.questions.slice(0, 5).map((q) => {
                  const pct = Math.round(((q.score - 1) / 4) * 100);
                  const col = alignColor(pct);
                  return (
                    <div key={q.question_id} style={{ background: CARD, border: `0.5px solid ${LINE}`, padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ fontFamily: G, fontSize: 10, color: GREY, letterSpacing: '0.08em' }}>{q.segment.toUpperCase()}</div>
                        <div style={{ fontFamily: BN, fontSize: 28, color: col, lineHeight: 1 }}>{pct}%</div>
                      </div>
                      <div style={{ fontFamily: G, fontSize: 13, color: CREAM, marginBottom: 8, lineHeight: 1.4 }}>{q.label}</div>
                      <div style={{ height: 2, background: LINE2, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: col, transition: 'width 0.8s ease' }} />
                      </div>
                      <div style={{ fontFamily: G, fontSize: 11, color: GREY, fontStyle: 'italic' as const }}>{q.diagnose}</div>
                    </div>
                  );
                })}
              </div>

              {/* Top 5 best aligned */}
              <div style={{ fontFamily: G, fontSize: 11, color: GREY, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
                STERKSTE ALIGNMENT — GEDEELDE KRACHT
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 2 }}>
                {[...result.questions].sort((a, b) => b.score - a.score).slice(0, 5).map((q) => {
                  const pct = Math.round(((q.score - 1) / 4) * 100);
                  const col = alignColor(pct);
                  return (
                    <div key={q.question_id} style={{ background: CARD, border: `0.5px solid ${LINE}`, padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ fontFamily: G, fontSize: 10, color: GREY, letterSpacing: '0.08em' }}>{q.segment.toUpperCase()}</div>
                        <div style={{ fontFamily: BN, fontSize: 28, color: col, lineHeight: 1 }}>{pct}%</div>
                      </div>
                      <div style={{ fontFamily: G, fontSize: 13, color: CREAM, marginBottom: 8, lineHeight: 1.4 }}>{q.label}</div>
                      <div style={{ height: 2, background: LINE2, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: col, transition: 'width 0.8s ease' }} />
                      </div>
                      <div style={{ fontFamily: G, fontSize: 11, color: GREY, fontStyle: 'italic' as const }}>{q.diagnose}</div>
                    </div>
                  );
                })}
              </div>

              {/* Download button */}
              <div style={{ marginTop: 32 }}>
                <button
                  onClick={() => downloadAlignmentPDF(result)}
                  style={{ fontFamily: BN, fontSize: 18, letterSpacing: '0.08em', color: DARK, background: ORANGE, border: 'none', borderRadius: 8, padding: '12px 0', width: 200, cursor: 'pointer' }}
                >
                  DOWNLOAD PDF
                </button>
              </div>

            </div>
            <div style={{ height: 2, background: ORANGE }} />
          </>)}
        </div>
      )}
    </div>
  );
}
