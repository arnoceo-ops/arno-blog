'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
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

interface MemberStats {
  user_id: string;
  email: string;
  // kwaliteit per segment
  strategie_kwaliteit: number;
  mensen_kwaliteit: number;
  uitvoering_kwaliteit: number;
  plan_kwaliteit: number;
  // voortgang per segment
  strategie_voortgang: number;
  mensen_voortgang: number;
  uitvoering_voortgang: number;
  volledigheid: number;
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

/* ── Member card ── */
function MemberCard({ member, rank }: { member: MemberStats; rank: number }) {
  const isTop = rank === 1;
  const kwaliteitLabel = member.plan_kwaliteit >= 70 ? 'STERK' : member.plan_kwaliteit >= 50 ? 'MATIG' : 'ZWAK';

  return (
    <div style={{ background: CARD, border: `0.5px solid ${isTop ? GREY : LINE}`, position: 'relative' as const }}>
      {isTop && <div style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 2, background: GREY }} />}

      {/* Header: email + plan kwaliteit */}
      <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${LINE2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY, marginBottom: 4 }}>#{rank}</div>
          <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, color: CREAM, maxWidth: 220, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const }}>
            {member.email}
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ fontFamily: BN, fontSize: 64, fontWeight: 400, lineHeight: 0.85, color: CREAM }}>
            {member.plan_kwaliteit}%
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY }}>PLAN KWALITEIT&nbsp;</span>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: ORANGE }}>{kwaliteitLabel}</span>
          </div>
        </div>
      </div>

      {/* Body: voortgang | kwaliteit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

        {/* Voortgang */}
        <div style={{ padding: '20px 28px', borderRight: `1px solid ${LINE2}` }}>
          <div style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' as const }}>
            VOORTGANG
          </div>
          <Row label="Strategie"  value={member.strategie_voortgang}  barColor={ORANGE} />
          <Row label="Mensen"     value={member.mensen_voortgang}     barColor={ORANGE} />
          <Row label="Uitvoering" value={member.uitvoering_voortgang} barColor={ORANGE} />
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${LINE2}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY }}>TOTAAL</span>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: CREAM }}>{member.volledigheid}%</span>
          </div>
        </div>

        {/* Kwaliteit */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' as const }}>
            KWALITEIT
          </div>
          <Row label="Strategie"  value={member.strategie_kwaliteit}  barColor={ORANGE} />
          <Row label="Mensen"     value={member.mensen_kwaliteit}     barColor={ORANGE} />
          <Row label="Uitvoering" value={member.uitvoering_kwaliteit} barColor={ORANGE} />
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${LINE2}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: GREY }}>TOTAAL</span>
            <span style={{ fontFamily: G, fontSize: 11, fontWeight: 400, color: CREAM }}>{member.plan_kwaliteit}%</span>
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
    { key: 'strategie_kwaliteit' as const, lbl: 'STRATEGIE'  },
    { key: 'mensen_kwaliteit'    as const, lbl: 'MENSEN'      },
    { key: 'uitvoering_kwaliteit' as const, lbl: 'UITVOERING' },
  ];

  const StatCell = ({ k, lbl, last, variant = 'secondary' }: { k: keyof MemberStats; lbl: string; last?: boolean; variant?: 'primary' | 'secondary' }) => (
    <div style={{ borderRight: last ? 'none' : `1px solid ${LINE2}`, paddingRight: last ? 0 : 48, marginRight: last ? 0 : 48 }}>
      <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, letterSpacing: '0.05em', color: variant === 'primary' ? CREAM : GREY, marginBottom: 8, textTransform: 'uppercase' as const }}>{lbl}</div>
      <div style={{ fontFamily: BN, fontSize: 120, fontWeight: 400, lineHeight: 1, color: variant === 'primary' ? ORANGE : CREAM }}>{avg(k)}%</div>
    </div>
  );

  return (
    <div style={{ borderBottom: `1px solid ${LINE}`, padding: '40px 40px 48px' }}>
      <div style={{ fontFamily: G, fontSize: 13, fontWeight: 400, letterSpacing: '0.05em', color: GREY, marginBottom: 40, textTransform: 'uppercase' as const }}>
        TEAM GEMIDDELDE — {members.length} {members.length === 1 ? 'LID' : 'LEDEN'}
      </div>
      <div style={{ display: 'flex', marginBottom: 48 }}>
        {row1.map((s, i) => <StatCell key={s.lbl} k={s.key} lbl={s.lbl} last={i === row1.length - 1} variant="primary" />)}
      </div>
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
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

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

        // Kwaliteit per segment (ArnoBot scores)
        const segKwaliteit = (seg: string) => {
          const sa = ua.filter((a) => a.question_id.startsWith(seg) && a.score !== null);
          if (!sa.length) return 0;
          return Math.round((sa.reduce((s, a) => s + (a.score ?? 0), 0) / sa.length / 5) * 100);
        };

        // Voortgang per segment (ingevulde velden / totaal)
        const segVoortgang = (seg: string) => {
          const filled = ua.filter((a) => a.question_id.startsWith(seg) && a.answer && a.answer.trim() !== '').length;
          const total  = SEGMENT_TOTALS[seg as keyof typeof SEGMENT_TOTALS] ?? 1;
          return Math.round((filled / total) * 100);
        };

        const strategie_kwaliteit  = segKwaliteit('strategie');
        const mensen_kwaliteit     = segKwaliteit('mensen');
        const uitvoering_kwaliteit = segKwaliteit('uitvoering');

        const plan_kwaliteit = Math.round(
          strategie_kwaliteit  * SEGMENT_WEIGHTS.strategie +
          mensen_kwaliteit     * SEGMENT_WEIGHTS.mensen +
          uitvoering_kwaliteit * SEGMENT_WEIGHTS.uitvoering
        );

        const strategie_voortgang  = segVoortgang('strategie');
        const mensen_voortgang     = segVoortgang('mensen');
        const uitvoering_voortgang = segVoortgang('uitvoering');

        const answered    = ua.filter((a) => a.answer && a.answer.trim() !== '').length;
        const volledigheid = Math.round((answered / 96) * 100);

        return {
          user_id: user.user_id, email: user.email,
          strategie_kwaliteit, mensen_kwaliteit, uitvoering_kwaliteit, plan_kwaliteit,
          strategie_voortgang, mensen_voortgang, uitvoering_voortgang, volledigheid,
        };
      });

      stats.sort((a, b) => b.plan_kwaliteit - a.plan_kwaliteit);
      setMembers(stats);
    } catch (err) { console.error(err); setError('Fout bij laden teamdata.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadTeamData(); }, [loadTeamData]);

  return (
    <div style={{ minHeight: '100vh', background: DARK, color: CREAM }}>

      <nav style={{ position: 'sticky' as const, top: 0, zIndex: 100, background: '#f5f0e8', borderBottom: '1px solid #e0d8cc', padding: '0 40px', display: 'flex', alignItems: 'center', height: 103, fontFamily: 'var(--font-bebas), sans-serif', fontSize: 36, letterSpacing: '3px' }}>
        <Link href="/canvas" style={{ fontFamily: BN, fontSize: 36, letterSpacing: '3px', color: '#1a1714', textDecoration: 'none', opacity: 0.4 }}>← CANVAS</Link>
      </nav>

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

      {!loading && !error && <TeamAverages members={members} />}

      {loading  && <div style={{ fontFamily: G, fontSize: 13, color: GREY,     textAlign: 'center' as const, padding: '80px 0' }}>Laden...</div>}
      {error    && <div style={{ fontFamily: G, fontSize: 13, color: '#c0392b', textAlign: 'center' as const, padding: '80px 0' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ padding: '40px' }}>
          {members.length === 0
            ? <div style={{ fontFamily: G, fontSize: 13, color: GREY, textAlign: 'center' as const, padding: '80px 0' }}>Geen teamleden gevonden.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', gap: 2 }}>
                {members.map((member, i) => <MemberCard key={member.user_id} member={member} rank={i + 1} />)}
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
