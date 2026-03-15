'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Default client for non-authed use (not used for RLS queries)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SEGMENT_WEIGHTS = {
  mensen: 0.4,
  strategie: 0.3,
  uitvoering: 0.3,
};

const TOTAL_QUESTIONS = {
  strategie: 15,
  mensen: 15,
  uitvoering: 15,
};

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

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          color: '#888',
          marginBottom: 5,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>{label}</span>
        <span style={{ color: score >= 70 ? '#EE7700' : score >= 50 ? '#ccc' : '#e05' }}>
          {score}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 2,
          overflow: 'hidden' as const,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  );
}

function MemberCard({ member, rank }: { member: MemberStats; rank: number }) {
  const isTop = rank === 1;
  return (
    <div
      style={{
        background: isTop ? '#111' : '#0d0d0d',
        border: `1px solid ${isTop ? '#EE7700' : '#1f1f1f'}`,
        borderRadius: 2,
        padding: '36px 44px',
        position: 'relative' as const,
      }}
    >
      {isTop && (
        <div
          style={{
            position: 'absolute' as const,
            top: -1,
            left: -1,
            right: -1,
            height: 2,
            background: '#EE7700',
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 13,
              color: '#EE7700',
              letterSpacing: '0.1em',
              marginBottom: 2,
            }}
          >
            #{rank}
          </div>
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 15,
              color: '#f0ede6',
              maxWidth: 260,
              overflow: 'hidden' as const,
              textOverflow: 'ellipsis' as const,
              whiteSpace: 'nowrap' as const,
            }}
          >
            {member.email}
          </div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 56,
              lineHeight: 1,
              color: member.plan_kwaliteit >= 70 ? '#EE7700' : '#f0ede6',
            }}
          >
            {member.plan_kwaliteit}%
          </div>
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 9,
              color: '#555',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
            }}
          >
            Plan Kwaliteit
          </div>
        </div>
      </div>

      <ScoreBar label="Strategie" score={member.strategie_score} color="#EE7700" />
      <ScoreBar label="Mensen" score={member.mensen_score} color="#c85a00" />
      <ScoreBar label="Uitvoering" score={member.uitvoering_score} color="#884400" />

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'Space Mono, monospace',
          fontSize: 16,
          color: '#555',
        }}
      >
        <span>VOLLEDIGHEID</span>
        <span style={{ color: '#888' }}>{member.volledigheid}%</span>
      </div>
    </div>
  );
}

function TeamAverages({ members }: { members: MemberStats[] }) {
  if (members.length === 0) return null;

  const avg = (key: keyof MemberStats) =>
    Math.round(
      members.reduce((sum, m) => sum + (m[key] as number), 0) / members.length
    );

  const avgStrategie = avg('strategie_score');
  const avgMensen = avg('mensen_score');
  const avgUitvoering = avg('uitvoering_score');
  const avgKwaliteit = avg('plan_kwaliteit');
  const avgVolledigheid = avg('volledigheid');

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid #1f1f1f',
        borderRadius: 2,
        padding: '24px 28px',
        marginBottom: 40,
      }}
    >
      <div
        style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 11,
          letterSpacing: '0.15em',
          color: '#555',
          textTransform: 'uppercase' as const,
          marginBottom: 20,
        }}
      >
        Team Gemiddelde — {members.length} {members.length === 1 ? 'lid' : 'leden'}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 24,
        }}
      >
        {[
          { label: 'Plan Kwaliteit', value: avgKwaliteit, highlight: true },
          { label: 'Strategie', value: avgStrategie, highlight: false },
          { label: 'Mensen', value: avgMensen, highlight: false },
          { label: 'Uitvoering', value: avgUitvoering, highlight: false },
          { label: 'Volledigheid', value: avgVolledigheid, highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label}>
            <div
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 40,
                lineHeight: 1,
                color: highlight ? '#EE7700' : '#f0ede6',
                marginBottom: 4,
              }}
            >
              {value}%
            </div>
            <div
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 9,
                color: '#555',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { userId, getToken } = useAuth();
  const [members, setMembers] = useState<MemberStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    if (!userId) return;

    try {
      const token = await getToken({ template: 'supabase' });
      const authedSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      // Check manager access
      const { data: managerCheck } = await authedSupabase
        .from('approved_users')
        .select('is_manager')
        .eq('user_id', userId)
        .single();

      if (!managerCheck?.is_manager) {
        setError('Geen toegang. Dit dashboard is alleen beschikbaar voor managers.');
        setLoading(false);
        return;
      }

      // Get all approved users
      const { data: approvedUsers, error: usersError } = await authedSupabase
        .from('approved_users')
        .select('user_id, email');

      if (usersError || !approvedUsers) throw usersError;

      // Get all canvas answers with scores
      const { data: answers, error: answersError } = await authedSupabase
        .from('canvas_answers')
        .select('user_id, question_id, score, answer');

      if (answersError) throw answersError;

      // Aggregate per user
      const stats: MemberStats[] = approvedUsers.map((user) => {
        const userAnswers = answers?.filter((a) => a.user_id === user.user_id) ?? [];

        const segmentScore = (segment: string) => {
          const segAnswers = userAnswers.filter(
            (a) => a.question_id.startsWith(segment) && a.score !== null
          );
          if (segAnswers.length === 0) return 0;
          const avg = segAnswers.reduce((s, a) => s + (a.score ?? 0), 0) / segAnswers.length;
          return Math.round((avg / 5) * 100);
        };

        const strategie = segmentScore('strategie');
        const mensen = segmentScore('mensen');
        const uitvoering = segmentScore('uitvoering');

        const planKwaliteit = Math.round(
          strategie * SEGMENT_WEIGHTS.strategie +
          mensen * SEGMENT_WEIGHTS.mensen +
          uitvoering * SEGMENT_WEIGHTS.uitvoering
        );

        const answered = userAnswers.filter((a) => a.answer && a.answer.trim() !== '').length;
        const volledigheid = Math.round((answered / 134) * 100);

        return {
          user_id: user.user_id,
          email: user.email,
          strategie_score: strategie,
          mensen_score: mensen,
          uitvoering_score: uitvoering,
          plan_kwaliteit: planKwaliteit,
          volledigheid,
          answered,
        };
      });

      // Sort by plan kwaliteit desc
      stats.sort((a, b) => b.plan_kwaliteit - a.plan_kwaliteit);
      setMembers(stats);
    } catch (err) {
      console.error(err);
      setError('Fout bij laden teamdata.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#f0ede6',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky' as const,
          top: 0,
          zIndex: 100,
          background: '#0a0a0a',
          borderBottom: '1px solid #1f1f1f',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}
      >
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {['HOME', 'ARNOBOT', 'BIO', 'BLOG', 'CANVAS', 'SUBSCRIBE'].map((item) => (
            <Link
              key={item}
              href={
                item === 'HOME' ? '/' :
                item === 'ARNOBOT' ? '/spar' :
                item === 'SUBSCRIBE' ? '/subscribe' :
                `/${item.toLowerCase()}`
              }
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 14,
                letterSpacing: '0.12em',
                color: item === 'CANVAS' ? '#EE7700' : '#888',
                textDecoration: 'none',
              }}
            >
              {item}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {(['STRATEGIE', 'MENSEN', 'UITVOERING'] as const).map((s) => (
            <Link
              key={s}
              href={`/canvas/${s.toLowerCase()}`}
              style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: 13,
                letterSpacing: '0.1em',
                color: '#555',
                textDecoration: 'none',
              }}
            >
              {s}
            </Link>
          ))}
          <Link
            href="/canvas"
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 13,
              letterSpacing: '0.1em',
              color: '#555',
              textDecoration: 'none',
            }}
          >
            DASHBOARD
          </Link>
          <span
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 13,
              letterSpacing: '0.1em',
              color: '#EE7700',
            }}
          >
            TEAM
          </span>
        </div>
      </nav>

      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #1f1f1f',
          padding: '48px 40px 40px',
        }}
      >
        <div
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 11,
            letterSpacing: '0.2em',
            color: '#EE7700',
            marginBottom: 8,
          }}
        >
          RDS CANVAS
        </div>
        <h1
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 'clamp(40px, 6vw, 72px)',
            letterSpacing: '0.04em',
            color: '#f0ede6',
            margin: 0,
            lineHeight: 1,
          }}
        >
          TEAM DASHBOARD
        </h1>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 12,
            color: '#555',
            marginTop: 12,
            letterSpacing: '0.02em',
          }}
        >
          Vergelijk plan kwaliteit en voortgang per teamlid
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '40px' }}>
        {loading && (
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 12,
              color: '#555',
              textAlign: 'center' as const,
              padding: '80px 0',
            }}
          >
            Laden...
          </div>
        )}

        {error && (
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 12,
              color: '#e05',
              textAlign: 'center' as const,
              padding: '80px 0',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <TeamAverages members={members} />

            {members.length === 0 ? (
              <div
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 12,
                  color: '#555',
                  textAlign: 'center' as const,
                  padding: '80px 0',
                }}
              >
                Geen teamleden gevonden.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))',
                  gap: 16,
                }}
              >
                {members.map((member, i) => (
                  <MemberCard key={member.user_id} member={member} rank={i + 1} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
