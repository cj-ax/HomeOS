/**
 * MeritPage — Age 7 Dashboard
 * Giant icon buttons (64px+ touch targets), bedtime countdown,
 * simplified chores, big Spotify player, reminders, weather.
 * Fire HD 8 (1280×800).
 */

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { BG } from '@/assets/bg';

/* ── Color Constants ── */
const C = {
  bg: '#0a0f14',
  card: 'rgba(12,16,22,0.55)',
  accent: '#2dd4bf',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  purple: '#c4b5fd',
  pink: '#f472b6',
  blue: '#60a5fa',
  orange: '#fb923c',
  white: '#f1f5f9',
  t1: '#cbd5e1',
  t2: '#94a3b8',
  t3: '#64748b',
  border: 'rgba(255,255,255,0.1)',
  borderGlass: 'rgba(255,255,255,0.15)',
  blur: 'blur(16px)',
  r: 22,
};

/* ── SVG helpers ── */
interface SvProps { children: ReactNode; sz?: number; c?: string; f?: boolean }
const Sv = ({ children, sz = 18, c = C.t2, f = false }: SvProps) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill={f ? c : 'none'} stroke={f ? 'none' : c}
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
    {children}
  </svg>
);

interface IconProps { sz?: number; c?: string }
const IC = {
  sun: (p: IconProps = {}) => <Sv {...p}><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Sv>,
  cloud: (p: IconProps = {}) => <Sv {...p}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></Sv>,
  snow: (p: IconProps = {}) => <Sv {...p}><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" /><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" /></Sv>,
  music: (p: IconProps = {}) => <Sv {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></Sv>,
  check: (p: IconProps = {}) => <Sv {...p}><path d="M20 6L9 17l-5-5" /></Sv>,
  play: (p: IconProps = {}) => <Sv f {...p}><path d="M5 3l14 9-14 9V3z" /></Sv>,
  pause: (p: IconProps = {}) => <Sv f {...p}><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></Sv>,
  prev: (p: IconProps = {}) => <Sv {...p}><path d="M19 20L9 12l10-8v16z" /><path d="M5 19V5" /></Sv>,
  next: (p: IconProps = {}) => <Sv {...p}><path d="M5 4l10 8-10 8V4z" /><path d="M19 5v14" /></Sv>,
  trophy: (p: IconProps = {}) => <Sv {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" /></Sv>,
  flame: (p: IconProps = {}) => <Sv {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></Sv>,
  send: (p: IconProps = {}) => <Sv {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></Sv>,
  moon: (p: IconProps = {}) => <Sv {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Sv>,
  megaphone: (p: IconProps = {}) => <Sv {...p}><path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></Sv>,
  bolt: (p: IconProps = {}) => <Sv f {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></Sv>,
  bell: (p: IconProps = {}) => <Sv {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></Sv>,
};

/* ── Primitives ── */
const Glass = ({ children, style = {}, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} style={{
    background: C.card, backdropFilter: C.blur, WebkitBackdropFilter: C.blur,
    borderRadius: C.r, border: `1px solid ${C.borderGlass}`, padding: 18,
    display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0,
    cursor: onClick ? 'pointer' : 'default', ...style,
  }}>{children}</div>
);

const Bar = ({ value = 0.5, color = C.accent, h = 4 }: { value?: number; color?: string; h?: number }) => (
  <div style={{ width: '100%', height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)' }}>
    <div style={{ width: `${Math.min(value, 1) * 100}%`, height: '100%', borderRadius: h, background: color, boxShadow: `0 0 6px ${color}30`, transition: 'width .5s ease' }} />
  </div>
);

const Pill = ({ children, color = C.accent }: { children: ReactNode; color?: string }) => (
  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 10, color, background: `${color}18`, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{children}</span>
);

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const getGreeting = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── Mock Data ── */
const MOCK_CHORES = [
  { id: 1, name: 'Make my bed', done: true, emoji: '🛏️', points: 5 },
  { id: 2, name: 'Put toys away', done: false, emoji: '🧸', points: 5 },
  { id: 3, name: 'Brush teeth', done: true, emoji: '🪥', points: 5 },
  { id: 4, name: 'Read a book', done: false, emoji: '📖', points: 10 },
];

const MOCK_LEADERBOARD = [
  { name: 'Remi', color: C.purple, points: 285 },
  { name: 'Desmond', color: C.amber, points: 240 },
  { name: 'Merit', color: C.pink, points: 195 },
];

const MOCK_REMINDERS = [
  { time: '4:00 PM', label: 'Dance class', emoji: '💃' },
  { time: '6:30 PM', label: 'Bath time', emoji: '🛁' },
];

const GREETINGS = [
  "It's snowy outside! Wear your warm coat and mittens today!",
  "You have dance class today — don't forget your dance shoes!",
  "Great job on your 9-day streak! You're a superstar!",
  "Time to wind down — bedtime is coming up soon!",
];

/* ── Bedtime countdown color logic ── */
const getBedtimeInfo = (now: Date) => {
  const bedtime = new Date(now);
  bedtime.setHours(20, 0, 0, 0); // 8:00 PM bedtime
  const diff = bedtime.getTime() - now.getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;

  let color: string;
  let label: string;
  let bg: string;

  if (mins <= 0) {
    color = C.red;
    bg = `${C.red}15`;
    label = 'Bedtime!';
  } else if (mins <= 30) {
    color = C.red;
    bg = `${C.red}15`;
    label = `${mins}m left`;
  } else if (mins <= 60) {
    color = C.amber;
    bg = `${C.amber}12`;
    label = `${mins}m left`;
  } else {
    color = C.green;
    bg = `${C.green}10`;
    label = hrs > 0 ? `${hrs}h ${m}m left` : `${mins}m left`;
  }

  return { color, bg, label, mins, progress: Math.max(0, Math.min(1, 1 - mins / (12 * 60))) };
};

/* ── Parent Broadcast Overlay ── */
const BroadcastOverlay = ({ message, onAcknowledge }: { message: string; onAcknowledge: () => void }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,8,12,0.92)',
    backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 28, padding: 40,
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: 24, background: `${C.accent}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {IC.megaphone({ sz: 40, c: C.accent })}
    </div>
    <div style={{ fontSize: 16, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 2 }}>
      Message from Mom & Dad
    </div>
    <div style={{
      fontSize: 28, fontWeight: 700, color: C.white, textAlign: 'center',
      maxWidth: 480, lineHeight: 1.4,
    }}>
      {message}
    </div>
    <button onClick={onAcknowledge} style={{
      marginTop: 16, padding: '18px 64px', borderRadius: 18,
      background: C.accent, border: 'none', color: C.bg,
      fontSize: 20, fontWeight: 700, cursor: 'pointer',
      boxShadow: `0 0 24px ${C.accent}40`,
      minHeight: 64, // 64px touch target for age 7
    }}>
      Got it!
    </button>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export function MeritPage() {
  const [time, setTime] = useState(new Date());
  const [chores, setChores] = useState(MOCK_CHORES);
  const [broadcast, setBroadcast] = useState<string | null>(null);
  const [spPlaying, setSpPlaying] = useState(true);
  const [spPos, setSpPos] = useState(25);
  const [view, setView] = useState<'home' | 'chores' | 'music'>('home');

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!spPlaying) return;
    const i = setInterval(() => setSpPos((p) => (p >= 180 ? 0 : p + 1)), 1000);
    return () => clearInterval(i);
  }, [spPlaying]);

  const hour = time.getHours();
  const greeting = getGreeting(hour);
  const tStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const bedtime = getBedtimeInfo(time);

  const toggleChore = (id: number) => {
    setChores((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c));
  };

  const doneCount = chores.filter((c) => c.done).length;
  const earnedPoints = chores.filter((c) => c.done).reduce((s, c) => s + c.points, 0);
  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.points - a.points);

  /* ── Chores sub-view ── */
  const ChoresView = () => (
    <div style={{
      position: 'relative', zIndex: 1, height: '100%', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Back button + header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setView('home')} style={{
          width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
          border: `1px solid ${C.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 20 }}>←</span>
        </button>
        <span style={{ fontSize: 24, fontWeight: 800 }}>My Chores</span>
        <div style={{ marginLeft: 'auto' }}>
          <Pill color={C.green}>
            <IC.bolt sz={12} c={C.green} />
            {earnedPoints} points today!
          </Pill>
        </div>
      </div>

      {/* Progress */}
      <Glass style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{doneCount} of {chores.length} done!</span>
          <span style={{ fontSize: 14, color: C.t2 }}>{Math.round((doneCount / chores.length) * 100)}%</span>
        </div>
        <Bar value={doneCount / chores.length} color={C.green} h={10} />
      </Glass>

      {/* Chore list — big touch targets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'auto' }}>
        {chores.map((c) => (
          <Glass
            key={c.id}
            onClick={() => toggleChore(c.id)}
            style={{
              padding: '14px 18px', flexDirection: 'row', alignItems: 'center', gap: 14,
              cursor: 'pointer', minHeight: 64,
              background: c.done ? `${C.green}10` : C.card,
              border: `1px solid ${c.done ? `${C.green}30` : C.borderGlass}`,
            }}
          >
            <span style={{ fontSize: 32 }}>{c.emoji}</span>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              border: `3px solid ${c.done ? C.green : C.t3}`,
              background: c.done ? C.green : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .2s ease',
            }}>
              {c.done && <IC.check sz={18} c={C.bg} />}
            </div>
            <span style={{
              fontSize: 18, fontWeight: 700, flex: 1,
              color: c.done ? C.t3 : C.white,
              textDecoration: c.done ? 'line-through' : 'none',
            }}>{c.name}</span>
            <div style={{
              padding: '4px 12px', borderRadius: 10,
              background: c.done ? `${C.green}15` : `${C.amber}15`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <IC.bolt sz={14} c={c.done ? C.green : C.amber} />
              <span style={{ fontSize: 16, fontWeight: 800, color: c.done ? C.green : C.amber }}>{c.points}</span>
            </div>
          </Glass>
        ))}
      </div>

      {doneCount === chores.length && (
        <Glass style={{
          padding: 20, alignItems: 'center',
          background: `linear-gradient(135deg, ${C.amber}15, ${C.green}15)`,
          border: `1px solid ${C.amber}30`,
        }}>
          <span style={{ fontSize: 40, marginBottom: 4 }}>🎉</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>All done! Amazing job!</span>
        </Glass>
      )}
    </div>
  );

  /* ── Music sub-view ── */
  const MusicView = () => (
    <div style={{
      position: 'relative', zIndex: 1, height: '100%', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setView('home')} style={{
          width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.08)',
          border: `1px solid ${C.border}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 20 }}>←</span>
        </button>
        <span style={{ fontSize: 24, fontWeight: 800 }}>Music</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        {/* Big album art */}
        <div style={{
          width: 200, height: 200, borderRadius: 24,
          background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(167,139,250,0.3)',
        }}>
          {IC.music({ sz: 64, c: 'rgba(255,255,255,0.5)' })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Let It Go</div>
          <div style={{ fontSize: 14, color: C.t2, marginTop: 4 }}>Idina Menzel</div>
        </div>

        {/* Progress */}
        <div style={{ width: '80%', maxWidth: 400 }}>
          <Bar value={spPos / 180} color={C.pink} h={6} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: C.t3, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(spPos)}</span>
            <span style={{ fontSize: 11, color: C.t3, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(180)}</span>
          </div>
        </div>

        {/* Big controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {IC.prev({ sz: 24, c: C.t1 })}
          </button>
          <button
            onClick={() => setSpPlaying(!spPlaying)}
            style={{
              width: 72, height: 72, borderRadius: 36,
              background: C.pink, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 24px ${C.pink}40`,
            }}
          >
            {spPlaying ? IC.pause({ sz: 28, c: C.white }) : IC.play({ sz: 28, c: C.white })}
          </button>
          <button style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.border}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {IC.next({ sz: 24, c: C.t1 })}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Home view (giant buttons) ── */
  const HomeView = () => (
    <div style={{
      position: 'relative', zIndex: 1, height: '100%', padding: 20,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: 'auto auto 1fr auto',
      gridTemplateAreas: `
        "header  header   header"
        "tip     tip      tip"
        "chores  music    right"
        "msg     msg      bedtime"
      `,
      gap: 14,
    }}>

      {/* Header */}
      <div style={{
        gridArea: 'header', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26, fontWeight: 800 }}>{greeting}, Merit!</span>
          <Pill color={C.pink}>
            <IC.flame sz={12} c={C.pink} />
            9-day streak!
          </Pill>
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tStr}</span>
      </div>

      {/* Today's tip */}
      <Glass style={{ gridArea: 'tip', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>💡</span>
        <div style={{ fontSize: 15, color: C.t1, lineHeight: 1.5, fontWeight: 600 }}>
          {GREETINGS[Math.floor(hour / 6) % GREETINGS.length]}
        </div>
      </Glass>

      {/* Chores big button */}
      <Glass
        onClick={() => setView('chores')}
        style={{
          gridArea: 'chores', padding: 20, cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          background: `linear-gradient(135deg, ${C.card}, ${C.amber}08)`,
          border: `1px solid ${C.amber}25`,
        }}
      >
        <span style={{ fontSize: 48 }}>✅</span>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Chores</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.t2 }}>{doneCount}/{chores.length}</span>
          <Bar value={doneCount / chores.length} color={C.green} h={6} />
        </div>
      </Glass>

      {/* Music big button */}
      <Glass
        onClick={() => setView('music')}
        style={{
          gridArea: 'music', padding: 20, cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center', gap: 10,
          background: `linear-gradient(135deg, ${C.card}, ${C.pink}08)`,
          border: `1px solid ${C.pink}25`,
        }}
      >
        <span style={{ fontSize: 48 }}>🎵</span>
        <span style={{ fontSize: 20, fontWeight: 800 }}>Music</span>
        {spPlaying && (
          <span style={{ fontSize: 12, color: C.pink, fontWeight: 600 }}>Now playing...</span>
        )}
      </Glass>

      {/* Right column: weather + reminders + leaderboard */}
      <div style={{ gridArea: 'right', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Mini weather */}
        <Glass style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>❄️</span>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>34°</div>
            <div style={{ fontSize: 11, color: C.t3 }}>Snowy today</div>
          </div>
        </Glass>

        {/* Reminders */}
        <Glass style={{ padding: 12, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, marginBottom: 8 }}>REMINDERS</div>
          {MOCK_REMINDERS.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: 10, color: C.t3 }}>{r.time}</div>
              </div>
            </div>
          ))}
        </Glass>

        {/* Mini leaderboard */}
        <Glass style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>🏆</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>LEADERBOARD</span>
          </div>
          {sorted.map((kid, i) => (
            <div key={kid.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 12, fontWeight: 800, width: 18, textAlign: 'center',
                color: i === 0 ? C.amber : C.t3,
              }}>
                {i === 0 ? '👑' : i + 1}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700, flex: 1,
                color: kid.name === 'Merit' ? C.white : C.t1,
              }}>{kid.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: kid.color }}>{kid.points}</span>
            </div>
          ))}
        </Glass>
      </div>

      {/* Message Mom & Dad */}
      <Glass
        onClick={() => setBroadcast('Time to come downstairs — dinner is ready!')}
        style={{
          gridArea: 'msg', padding: 16, cursor: 'pointer',
          flexDirection: 'row', alignItems: 'center', gap: 14,
          minHeight: 64,
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${C.accent}15`, border: `1px solid ${C.accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {IC.send({ sz: 22, c: C.accent })}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Message Mom & Dad</div>
          <div style={{ fontSize: 11, color: C.t3 }}>Tap to send a message</div>
        </div>
      </Glass>

      {/* Bedtime countdown */}
      <Glass style={{
        gridArea: 'bedtime', padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 14,
        background: bedtime.bg, border: `1px solid ${bedtime.color}25`,
        minHeight: 64,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${bedtime.color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {IC.moon({ sz: 22, c: bedtime.color })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: bedtime.color }}>Bedtime</div>
          <div style={{ fontSize: 11, color: C.t3 }}>8:00 PM</div>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: bedtime.color }}>{bedtime.label}</span>
      </Glass>
    </div>
  );

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      color: C.white, position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,20,0.75)' }} />
      {broadcast && <BroadcastOverlay message={broadcast} onAcknowledge={() => setBroadcast(null)} />}
      {view === 'home' && <HomeView />}
      {view === 'chores' && <ChoresView />}
      {view === 'music' && <MusicView />}
    </div>
  );
}
