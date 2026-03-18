/**
 * RemiPage — Age 11 Dashboard
 * Near-adult interface: morning greeting, weather, calendar, Spotify,
 * chores with streaks, leaderboard, message parent.
 * Designed for Fire HD 8 (1280×800).
 */

import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { BG } from '@/assets/bg';

/* ── Color Constants (matches HubPage) ── */
const C = {
  bg: '#0a0f14',
  card: 'rgba(12,16,22,0.55)',
  cardSolid: '#161b24',
  well: 'rgba(8,10,16,0.6)',
  accent: '#2dd4bf',
  accentDim: 'rgba(45,212,191,0.12)',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  purple: '#c4b5fd',
  pink: '#f472b6',
  blue: '#60a5fa',
  white: '#f1f5f9',
  t1: '#cbd5e1',
  t2: '#94a3b8',
  t3: '#64748b',
  border: 'rgba(255,255,255,0.1)',
  borderGlass: 'rgba(255,255,255,0.15)',
  shadow: '0 4px 20px rgba(0,0,0,0.3)',
  blur: 'blur(16px)',
  r: 18,
};

/* ── SVG Icon helpers ── */
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
  rain: (p: IconProps = {}) => <Sv {...p}><path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /></Sv>,
  snow: (p: IconProps = {}) => <Sv {...p}><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" /><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" /><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" /></Sv>,
  music: (p: IconProps = {}) => <Sv {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></Sv>,
  cal: (p: IconProps = {}) => <Sv {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Sv>,
  check: (p: IconProps = {}) => <Sv {...p}><path d="M20 6L9 17l-5-5" /></Sv>,
  star: (p: IconProps = {}) => <Sv f {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Sv>,
  msg: (p: IconProps = {}) => <Sv {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" /></Sv>,
  play: (p: IconProps = {}) => <Sv f {...p}><path d="M5 3l14 9-14 9V3z" /></Sv>,
  pause: (p: IconProps = {}) => <Sv f {...p}><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></Sv>,
  prev: (p: IconProps = {}) => <Sv {...p}><path d="M19 20L9 12l10-8v16z" /><path d="M5 19V5" /></Sv>,
  next: (p: IconProps = {}) => <Sv {...p}><path d="M5 4l10 8-10 8V4z" /><path d="M19 5v14" /></Sv>,
  trophy: (p: IconProps = {}) => <Sv {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" /></Sv>,
  flame: (p: IconProps = {}) => <Sv {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></Sv>,
  send: (p: IconProps = {}) => <Sv {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></Sv>,
  megaphone: (p: IconProps = {}) => <Sv {...p}><path d="M3 11l18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></Sv>,
};

const WxIcon = ({ t, sz = 20 }: { t: string; sz?: number }) => {
  const m: Record<string, (p: IconProps) => JSX.Element> = { sun: IC.sun, cloud: IC.cloud, rain: IC.rain, snow: IC.snow };
  return (m[t] || IC.sun)({ sz, c: t === 'sun' ? '#fbbf24' : C.t2 });
};

/* ── Reusable Primitives ── */
const Glass = ({ children, style = {}, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} style={{
    background: C.card, backdropFilter: C.blur, WebkitBackdropFilter: C.blur,
    borderRadius: C.r, border: `1px solid ${C.borderGlass}`, padding: 16,
    display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, minHeight: 0,
    cursor: onClick ? 'pointer' : 'default', ...style,
  }}>{children}</div>
);

const Dot = ({ color = C.green, sz = 7 }: { color?: string; sz?: number }) => (
  <span style={{ width: sz, height: sz, borderRadius: sz, background: color, boxShadow: `0 0 8px ${color}50`, display: 'inline-block', flexShrink: 0 }} />
);

const Bar = ({ value = 0.5, color = C.accent, h = 4 }: { value?: number; color?: string; h?: number }) => (
  <div style={{ width: '100%', height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)' }}>
    <div style={{ width: `${Math.min(value, 1) * 100}%`, height: '100%', borderRadius: h, background: color, boxShadow: `0 0 6px ${color}30`, transition: 'width .5s ease' }} />
  </div>
);

const Pill = ({ children, color = C.accent }: { children: ReactNode; color?: string }) => (
  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 8, color, background: `${color}18`, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{children}</span>
);

/* ── Mock Data ── */
const MOCK_CHORES = [
  { id: 1, name: 'Make bed', done: true, points: 5 },
  { id: 2, name: 'Unload dishwasher', done: false, points: 10 },
  { id: 3, name: 'Pick up room', done: false, points: 5 },
  { id: 4, name: 'Practice piano', done: true, points: 15 },
  { id: 5, name: 'Homework', done: false, points: 20 },
  { id: 6, name: 'Read 20 minutes', done: false, points: 10 },
];

const MOCK_LEADERBOARD = [
  { name: 'Remi', color: C.purple, points: 285, streak: 7 },
  { name: 'Desmond', color: C.amber, points: 240, streak: 4 },
  { name: 'Merit', color: C.pink, points: 195, streak: 9 },
];

const MOCK_SCHEDULE = [
  { time: '3:30 PM', label: 'Piano lesson', color: C.purple },
  { time: '5:00 PM', label: 'Basketball practice', color: C.amber },
  { time: '7:00 PM', label: 'Family movie night', color: C.blue },
];

const MOCK_FORECAST = [
  { d: 'Today', hi: 34, lo: 21, t: 'snow' },
  { d: 'Thu', hi: 28, lo: 17, t: 'snow' },
  { d: 'Fri', hi: 32, lo: 19, t: 'cloud' },
  { d: 'Sat', hi: 36, lo: 22, t: 'sun' },
  { d: 'Sun', hi: 38, lo: 24, t: 'sun' },
];

const GREETINGS = [
  "It's going to be a snowy day — bundle up! Don't forget your boots.",
  "You have basketball practice tonight, so eat well and stay hydrated!",
  "Piano lesson at 3:30 today. Make sure your music book is packed!",
  "Great job keeping your streak going — 7 days in a row!",
];

/* ── Format seconds → m:ss ── */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

/* ── Time-based greeting ── */
const getGreeting = (hour: number) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ── Parent Broadcast Overlay ── */
const BroadcastOverlay = ({ message, onAcknowledge }: { message: string; onAcknowledge: () => void }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,8,12,0.92)',
    backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32,
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 20, background: `${C.accent}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {IC.megaphone({ sz: 32, c: C.accent })}
    </div>
    <div style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 2 }}>
      Message from Mom & Dad
    </div>
    <div style={{
      fontSize: 24, fontWeight: 700, color: C.white, textAlign: 'center',
      maxWidth: 480, lineHeight: 1.4,
    }}>
      {message}
    </div>
    <button onClick={onAcknowledge} style={{
      marginTop: 16, padding: '14px 48px', borderRadius: 14,
      background: C.accent, border: 'none', color: C.bg,
      fontSize: 16, fontWeight: 700, cursor: 'pointer',
      boxShadow: `0 0 20px ${C.accent}40`,
    }}>
      Got it!
    </button>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════ */
export function RemiPage() {
  const [time, setTime] = useState(new Date());
  const [chores, setChores] = useState(MOCK_CHORES);
  const [broadcast, setBroadcast] = useState<string | null>(null);

  // Mock Spotify state
  const [spPlaying, setSpPlaying] = useState(true);
  const [spPos, setSpPos] = useState(67);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Simulate Spotify progress
  useEffect(() => {
    if (!spPlaying) return;
    const i = setInterval(() => setSpPos((p) => (p >= 214 ? 0 : p + 1)), 1000);
    return () => clearInterval(i);
  }, [spPlaying]);

  const hour = time.getHours();
  const greeting = getGreeting(hour);
  const tStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const toggleChore = (id: number) => {
    setChores((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c));
  };

  const doneCount = chores.filter((c) => c.done).length;
  const earnedPoints = chores.filter((c) => c.done).reduce((s, c) => s + c.points, 0);
  const totalPoints = chores.reduce((s, c) => s + c.points, 0);

  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.points - a.points);

  return (
    <div style={{
      height: '100vh', width: '100vw', overflow: 'hidden',
      backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      color: C.white, position: 'relative',
    }}>
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,15,20,0.75)' }} />

      {/* Parent broadcast overlay */}
      {broadcast && <BroadcastOverlay message={broadcast} onAcknowledge={() => setBroadcast(null)} />}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, height: '100%', padding: 20,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 280px',
        gridTemplateRows: 'auto 1fr 1fr',
        gridTemplateAreas: `
          "header   header   header"
          "greeting chores   sidebar"
          "music    chores   sidebar"
        `,
        gap: 14,
      }}>

        {/* ── Header ── */}
        <div style={{
          gridArea: 'header', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 800 }}>{greeting}, Remi</span>
            <Pill color={C.purple}>
              <IC.flame sz={10} c={C.purple} />
              7-day streak
            </Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: C.t2 }}>{dateStr}</span>
            <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tStr}</span>
          </div>
        </div>

        {/* ── Greeting + Weather + Schedule ── */}
        <div style={{ gridArea: 'greeting', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Morning tip */}
          <Glass style={{ padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Today's Tip
            </div>
            <div style={{ fontSize: 14, color: C.t1, lineHeight: 1.5 }}>
              {GREETINGS[Math.floor(hour / 6) % GREETINGS.length]}
            </div>
          </Glass>

          {/* Weather */}
          <Glass style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {IC.sun({ sz: 14, c: C.accent })}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>WEATHER</span>
            </div>
            <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between' }}>
              {MOCK_FORECAST.map((d) => (
                <div key={d.d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                  <span style={{ fontSize: 10, color: C.t3, fontWeight: 600 }}>{d.d}</span>
                  <WxIcon t={d.t} sz={18} />
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{d.hi}°</span>
                  <span style={{ fontSize: 10, color: C.t3 }}>{d.lo}°</span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Schedule */}
          <Glass style={{ padding: 14, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {IC.cal({ sz: 14, c: C.blue })}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>TODAY'S SCHEDULE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MOCK_SCHEDULE.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Dot color={ev.color} sz={6} />
                  <span style={{ fontSize: 11, color: C.t3, fontWeight: 600, width: 60, flexShrink: 0 }}>{ev.time}</span>
                  <span style={{ fontSize: 12, color: C.t1, fontWeight: 600 }}>{ev.label}</span>
                </div>
              ))}
            </div>
          </Glass>
        </div>

        {/* ── Chores ── */}
        <Glass style={{ gridArea: 'chores', padding: 14, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {IC.check({ sz: 14, c: C.amber })}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>CHORES</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: C.t3 }}>{doneCount}/{chores.length}</span>
              <Pill color={C.green}>+{earnedPoints} pts</Pill>
            </div>
          </div>

          {/* Progress bar */}
          <Bar value={doneCount / chores.length} color={C.green} h={6} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {chores.map((c) => (
              <div
                key={c.id}
                onClick={() => toggleChore(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 12, background: c.done ? `${C.green}10` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${c.done ? `${C.green}30` : C.border}`,
                  cursor: 'pointer', transition: 'all .2s ease',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  border: `2px solid ${c.done ? C.green : C.t3}`,
                  background: c.done ? C.green : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s ease', flexShrink: 0,
                }}>
                  {c.done && <IC.check sz={12} c={C.bg} />}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600, flex: 1,
                  color: c.done ? C.t3 : C.t1,
                  textDecoration: c.done ? 'line-through' : 'none',
                }}>{c.name}</span>
                <Pill color={c.done ? C.t3 : C.amber}>{c.points} pts</Pill>
              </div>
            ))}
          </div>

          {/* Bonus: all done message */}
          {doneCount === chores.length && (
            <div style={{
              marginTop: 12, padding: 12, borderRadius: 12,
              background: `${C.green}15`, border: `1px solid ${C.green}30`,
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>
                All done! +{totalPoints} points earned today
              </span>
            </div>
          )}
        </Glass>

        {/* ── Music (Spotify) ── */}
        <Glass style={{ gridArea: 'music', padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {IC.music({ sz: 14, c: C.green })}
            <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>NOW PLAYING</span>
            <Dot color={C.green} sz={5} />
          </div>

          <div style={{ display: 'flex', gap: 14, flex: 1 }}>
            {/* Album art placeholder */}
            <div style={{
              width: 90, height: 90, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {IC.music({ sz: 32, c: 'rgba(255,255,255,0.6)' })}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>Cruel Summer</div>
              <div style={{ fontSize: 11, color: C.t2 }}>Taylor Swift</div>

              {/* Progress */}
              <div style={{ marginTop: 4 }}>
                <Bar value={spPos / 214} color={C.green} h={3} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: C.t3, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(spPos)}</span>
                  <span style={{ fontSize: 9, color: C.t3, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(214)}</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 2 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {IC.prev({ sz: 18, c: C.t2 })}
                </button>
                <button
                  onClick={() => setSpPlaying(!spPlaying)}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    background: C.green, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {spPlaying ? IC.pause({ sz: 16, c: C.bg }) : IC.play({ sz: 16, c: C.bg })}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {IC.next({ sz: 18, c: C.t2 })}
                </button>
              </div>
            </div>
          </div>
        </Glass>

        {/* ── Right Sidebar: Leaderboard + Message Parent ── */}
        <div style={{ gridArea: 'sidebar', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Leaderboard */}
          <Glass style={{ padding: 14, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {IC.trophy({ sz: 14, c: C.amber })}
              <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>LEADERBOARD</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.map((kid, i) => (
                <div key={kid.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 7,
                    background: i === 0 ? `${C.amber}20` : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    color: i === 0 ? C.amber : C.t3,
                  }}>
                    {i + 1}
                  </span>
                  {/* Avatar circle */}
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    background: `${kid.color}25`, border: `2px solid ${kid.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: kid.color,
                  }}>
                    {kid.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: kid.name === 'Remi' ? C.white : C.t1 }}>
                      {kid.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <IC.flame sz={10} c={C.amber} />
                      <span style={{ fontSize: 9, color: C.t3 }}>{kid.streak} day streak</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: kid.color }}>
                    {kid.points}
                  </span>
                </div>
              ))}
            </div>

            {/* Weekly progress */}
            <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.t3, marginBottom: 6 }}>THIS WEEK</div>
              {sorted.map((kid) => (
                <div key={kid.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: C.t2, width: 50, flexShrink: 0 }}>{kid.name}</span>
                  <div style={{ flex: 1 }}><Bar value={kid.points / 300} color={kid.color} h={4} /></div>
                </div>
              ))}
            </div>
          </Glass>

          {/* Message Parent */}
          <Glass
            onClick={() => setBroadcast('Time to come downstairs — dinner is ready!')}
            style={{
              padding: 14, cursor: 'pointer',
              flexDirection: 'row', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: `${C.accent}15`, border: `1px solid ${C.accent}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {IC.send({ sz: 18, c: C.accent })}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Message Mom & Dad</div>
              <div style={{ fontSize: 10, color: C.t3 }}>Tap to send a quick message</div>
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
}
