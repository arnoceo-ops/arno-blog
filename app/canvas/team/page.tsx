'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const SEGMENT_WEIGHTS = { mensen: 0.4, strategie: 0.3, uitvoering: 0.3 };

const G  = 'Geist, system-ui, sans-serif';
const BN = 'Bebas Neue, sans-serif';
const SM = 'Space Mono, monospace';

const ORANGE = '#EE7700';
const GREY   = 'rgb(136, 136, 136)';
const CREAM  = '#f0ede6';
const DARK   = '#0a0a0a';
const CARD   = '#0d0d0d';
const LINE   = '#1f1f1f';
const LINE2  = '#1a1a1a';

interface MemberStats {
  user_id: string;
  email: string;
  strategie_score: number;
  mensen_score: number;
  uitvoering_score: number;
  plan_kwaliteit: number;
  volledigheid: number;
  answered: number;
}

/* ── Score bar inside member card ── */
function ScoreBar({ name, score }: { name: string; score: number }) {
  const barColor = score >= 70 ? ORANGE : score >= 50 ? '#888' : '#c0392b';
  const pctColor = score >= 70 ? ORANGE : score >= 50 ? CREAM  : '#c0392b';
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: GREY }}>
          {name}
        </span>
        <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: CREAM }}>
          {score}%
        </span>
      </div>
      <div style={{ height: 2, background: LINE2 }}>
        <div style={{ height: '100%', width: `${score}%`, background: CREAM, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

/* ── Member card ── */
function MemberCard({ member, rank }: { member: MemberStats; rank: number }) {
  const isTop = rank === 1;
  const kwaliteitLabel = member.plan_kwaliteit >= 70 ? 'STERK' : member.plan_kwaliteit >= 50 ? 'MATIG' : 'ZWAK';

  return (
    <div style={{ background: CARD, border: `0.5px solid ${isTop ? GREY : LINE}`, position: 'relative' as const }}>
      {isTop && <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 2, background: GREY }} />}

      {/* Header row */}
      <div style={{ padding: '28px 32px 24px', borderBottom: `1px solid ${LINE2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: GREY, marginBottom: 6 }}>#{rank}</div>
          <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: CREAM, maxWidth: 240, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const }}>
            {member.email}
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontFamily: BN, fontSize: 72, fontWeight: 400, lineHeight: 0.85, color: CREAM }}>
            {member.plan_kwaliteit}%
          </div>
          <div style={{ marginTop: 6 }}>
            <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: GREY }}>PLAN KWALITEIT&nbsp;</span>
            <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: ORANGE }}>{kwaliteitLabel}</span>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div style={{ padding: '24px 32px' }}>
        <ScoreBar name="STRATEGIE"  score={member.strategie_score} />
        <ScoreBar name="MENSEN"     score={member.mensen_score} />
        <ScoreBar name="UITVOERING" score={member.uitvoering_score} />

        <div style={{ marginTop: 8, paddingTop: 16, borderTop: `1px solid ${LINE2}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: GREY }}>VOLLEDIGHEID</span>
            <span style={{ fontFamily: G, fontSize: 18, fontWeight: 400, color: GREY }}>{member.volledigheid}%</span>
          </div>
          <div style={{ height: 2, background: LINE2 }}>
            <div style={{ height: '100%', width: `${member.volledigheid}%`, background: CREAM, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Team averages block ── */
function TeamAverages({ members }: { members: MemberStats[] }) {
  if (members.length === 0) return null;
  const avg = (key: keyof MemberStats) =>
    Math.round(members.reduce((s, m) => s + (m[key] as number), 0) / members.length);

  const row1 = [
    { key: 'plan_kwaliteit' as const, lbl: 'PLAN KWALITEIT' },
    { key: 'volledigheid'   as const, lbl: 'VOLLEDIGHEID'   },
  ];
  const row2 = [
    { key: 'strategie_score' as const, lbl: 'STRATEGIE'  },
    { key: 'mensen_score'    as const, lbl: 'MENSEN'      },
    { key: 'uitvoering_score' as const, lbl: 'UITVOERING' },
  ];

  const StatCell = ({ k, lbl, last, variant = 'secondary' }: { k: keyof MemberStats; lbl: string; last?: boolean; variant?: 'primary' | 'secondary' }) => (
    <div style={{ borderRight: last ? 'none' : `1px solid ${LINE2}`, paddingRight: last ? 0 : 48, paddingLeft: 0, marginRight: last ? 0 : 48 }}>
      <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, letterSpacing: '0.05em', color: variant === 'primary' ? CREAM : GREY, marginBottom: 8, textTransform: 'uppercase' as const }}>{lbl}</div>
      <div style={{ fontFamily: BN, fontSize: 120, fontWeight: 400, lineHeight: 1, color: variant === 'primary' ? ORANGE : CREAM }}>{avg(k)}%</div>
    </div>
  );

  return (
    <div style={{ borderBottom: `1px solid ${LINE}`, padding: '40px 40px 48px' }}>
      <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, letterSpacing: '0.05em', color: GREY, marginBottom: 40, textTransform: 'uppercase' as const }}>
        TEAM GEMIDDELDE — {members.length} {members.length === 1 ? 'LID' : 'LEDEN'}
      </div>

      {/* Row 1: plan kwaliteit + volledigheid */}
      <div style={{ display: 'flex', marginBottom: 48 }}>
        {row1.map((s, i) => <StatCell key={s.lbl} k={s.key} lbl={s.lbl} last={i === row1.length - 1} variant="primary" />)}
      </div>

      {/* Row 2: strategie, mensen, uitvoering */}
      <div style={{ display: 'flex' }}>
        {row2.map((s, i) => <StatCell key={s.lbl} k={s.key} lbl={s.lbl} last={i === row2.length - 1} variant="secondary" />)}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function TeamPage() {
  const { userId, getToken } = useAuth();
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    if (!userId) return;
    try {
      const token = await getToken({ template: 'supabase' });
      const db = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      const { data: managerCheck } = await db.from('approved_users').select('is_manager').eq('user_id', userId).single();
      if (!managerCheck?.is_manager) { setError('Geen toegang. Dit dashboard is alleen beschikbaar voor managers.'); setLoading(false); return; }

      const { data: approvedUsers, error: ue } = await db.from('approved_users').select('user_id, email');
      if (ue || !approvedUsers) throw ue;

      const { data: answers, error: ae } = await db.from('canvas_answers').select('user_id, question_id, score, answer');
      if (ae) throw ae;

      const stats: MemberStats[] = approvedUsers.map((user) => {
        const ua = answers?.filter((a) => a.user_id === user.user_id) ?? [];
        const segScore = (seg: string) => {
          const sa = ua.filter((a) => a.question_id.startsWith(seg) && a.score !== null);
          if (!sa.length) return 0;
          return Math.round((sa.reduce((s, a) => s + (a.score ?? 0), 0) / sa.length / 5) * 100);
        };
        const strategie   = segScore('strategie');
        const mensen      = segScore('mensen');
        const uitvoering  = segScore('uitvoering');
        const plan_kwaliteit = Math.round(strategie * SEGMENT_WEIGHTS.strategie + mensen * SEGMENT_WEIGHTS.mensen + uitvoering * SEGMENT_WEIGHTS.uitvoering);
        const answered    = ua.filter((a) => a.answer && a.answer.trim() !== '').length;
        return { user_id: user.user_id, email: user.email, strategie_score: strategie, mensen_score: mensen, uitvoering_score: uitvoering, plan_kwaliteit, volledigheid: Math.round((answered / 134) * 100), answered };
      });

      stats.sort((a, b) => b.plan_kwaliteit - a.plan_kwaliteit);
      setMembers(stats);
    } catch (err) { console.error(err); setError('Fout bij laden teamdata.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadTeamData(); }, [loadTeamData]);

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: CREAM }}>

      <nav style={{ position: 'sticky' as const, top: 0, zIndex: 100, background: '#f0ede6', borderBottom: '1px solid #ddd', padding: '0 40px', display: 'flex', alignItems: 'center', height: 103 }}>
        <Link href="https://canvas.royaldutchsales.com/canvas" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <span style={{ fontFamily: BN, fontSize: 54, fontWeight: 400, lineHeight: '54px', color: ORANGE }}>←</span>
          <span style={{ fontFamily: BN, fontSize: 54, fontWeight: 400, lineHeight: '54px', color: ORANGE, letterSpacing: '0.05em' }}>CANVAS</span>
        </Link>
      </nav>

      {/* Page header */}
      <div style={{ borderBottom: `1px solid ${LINE}`, padding: '48px 40px 40px' }}>
        <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, letterSpacing: '0.05em', color: ORANGE, marginBottom: 8, textTransform: 'uppercase' as const }}>
          ROYAL DUTCH SALES
        </div>
        <h1 style={{ fontFamily: BN, fontSize: 'clamp(48px, 7vw, 96px)' as any, fontWeight: 400, letterSpacing: '0.02em', color: CREAM, margin: 0, lineHeight: 1 }}>
          TEAM DASHBOARD
        </h1>
        <p style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: GREY, marginTop: 12, letterSpacing: '0.03em', textTransform: 'uppercase' as const }}>
          VERGELIJK PLAN KWALITEIT EN VOORTGANG PER TEAMLID
        </p>
      </div>

      {/* Team averages */}
      {!loading && !error && <TeamAverages members={members} />}

      {/* States */}
      {loading  && <div style={{ fontFamily: G, fontSize: 13, color: GREY,     textAlign: 'center' as const, padding: '80px 0' }}>Laden...</div>}
      {error    && <div style={{ fontFamily: G, fontSize: 13, color: '#c0392b', textAlign: 'center' as const, padding: '80px 0' }}>{error}</div>}

      {/* Member cards */}
      {!loading && !error && (
        <div style={{ padding: '40px' }}>
          {members.length === 0
            ? <div style={{ fontFamily: G, fontSize: 13, color: GREY, textAlign: 'center' as const, padding: '80px 0' }}>Geen teamleden gevonden.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(560px, 1fr))', gap: 2 }}>
                {members.map((member, i) => <MemberCard key={member.user_id} member={member} rank={i + 1} />)}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
