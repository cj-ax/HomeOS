/**
 * HubPage — Main Family Dashboard
 * Grid-based widget layout with glassmorphism design.
 * Source of truth: smart-home-dashboard.jsx
 */

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react';
import { BG } from '@/assets/bg';
import { useWeather, wmoToType, wmoToDescription } from '@/hooks/useWeather';
import { usePirateWeather } from '@/hooks/usePirateWeather';
import { useNWSForecast } from '@/hooks/useNWSForecast';
import { useNWSAlerts } from '@/hooks/useNWSAlerts';
import { useSpotify } from '@/hooks/useSpotify';
import { useMessages } from '@/hooks/useMessages';
import { usePlants } from '@/hooks/usePlants';
import { useCalendar, formatEventTime, formatEventDate, isToday, calendarColor, calendarLabel } from '@/hooks/useCalendar';
import { useRing } from '@/hooks/useRing';
import { useMealPlan, getNextMeal, getTodayMeals, formatDayShort, mealTypeColor, mealTypeLabel } from '@/hooks/useMealPlan';
import type { Meal, MealDay } from '@/hooks/useMealPlan';

/* ── Color Constants ── */
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

/* ── SVG Icon System ── */
interface SvProps {
  children: ReactNode;
  sz?: number;
  c?: string;
  f?: boolean;
}

/** Format ISO timestamp to relative time */
const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

/** Format seconds → m:ss */
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const Sv = ({ children, sz = 18, c = C.t2, f = false }: SvProps) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill={f ? c : 'none'}
    stroke={f ? 'none' : c}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
    aria-hidden="true"
  >
    {children}
  </svg>
);

interface IconProps {
  sz?: number;
  c?: string;
}

const IC = {
  home: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </Sv>
  ),
  shield: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Sv>
  ),
  zap: (p: IconProps = {}) => (
    <Sv f {...p}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Sv>
  ),
  sun: (p: IconProps = {}) => (
    <Sv {...p}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </Sv>
  ),
  cloud: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </Sv>
  ),
  rain: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M16 13v8M8 13v8M12 15v8M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </Sv>
  ),
  snow: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="22" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="22" r="1" fill="currentColor" stroke="none" />
    </Sv>
  ),
  music: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </Sv>
  ),
  cal: (p: IconProps = {}) => (
    <Sv {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Sv>
  ),
  car: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M5 17h14M3 15V9a2 2 0 0 1 2-2h1l2-3h8l2 3h1a2 2 0 0 1 2 2v6" />
      <circle cx="7" cy="19" r="2" />
      <circle cx="17" cy="19" r="2" />
    </Sv>
  ),
  leaf: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8A5 5 0 0 1 22 3c-1 4-4 8-12 11" />
    </Sv>
  ),
  msg: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
    </Sv>
  ),
  bell: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Sv>
  ),
  cam: (p: IconProps = {}) => (
    <Sv {...p}>
      <rect x="1" y="5" width="22" height="14" rx="3" />
      <circle cx="12" cy="12" r="3" />
    </Sv>
  ),
  drop: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" />
    </Sv>
  ),
  lock: (p: IconProps = {}) => (
    <Sv {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Sv>
  ),
  play: (p: IconProps = {}) => (
    <Sv f {...p}>
      <path d="M5 3l14 9-14 9V3z" />
    </Sv>
  ),
  pause: (p: IconProps = {}) => (
    <Sv f {...p}>
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </Sv>
  ),
  prev: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M19 20L9 12l10-8v16z" />
      <path d="M5 19V5" />
    </Sv>
  ),
  next: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M5 4l10 8-10 8V4z" />
      <path d="M19 5v14" />
    </Sv>
  ),
  x: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Sv>
  ),
  alert: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Sv>
  ),
  flame: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Sv>
  ),
  back: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </Sv>
  ),
  speaker: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </Sv>
  ),
  library: (p: IconProps = {}) => (
    <Sv {...p}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </Sv>
  ),
};

/* ── Reusable Primitives ── */

const Dot = ({ color = C.green, sz = 7 }: { color?: string; sz?: number }) => (
  <span
    style={{
      width: sz,
      height: sz,
      borderRadius: sz,
      background: color,
      boxShadow: `0 0 8px ${color}50`,
      display: 'inline-block',
      flexShrink: 0,
    }}
  />
);

const Pill = ({ children, color = C.accent }: { children: ReactNode; color?: string }) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 8,
      color,
      background: `${color}18`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
    }}
  >
    {children}
  </span>
);

const Bar = ({
  value = 0.5,
  color = C.accent,
  h = 4,
}: {
  value?: number;
  color?: string;
  h?: number;
}) => (
  <div style={{ width: '100%', height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)' }}>
    <div
      style={{
        width: `${Math.min(value, 1) * 100}%`,
        height: '100%',
        borderRadius: h,
        background: color,
        boxShadow: `0 0 6px ${color}30`,
        transition: 'width .5s ease',
      }}
    />
  </div>
);

const Spark = ({
  data,
  color = C.accent,
  h = 28,
}: {
  data: number[];
  color?: string;
  h?: number;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const w = 140;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`)
    .join(' ');
  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
      />
    </svg>
  );
};

const WxI = ({ t, sz = 16 }: { t: string; sz?: number }) => {
  const m: Record<string, (p: IconProps) => JSX.Element> = {
    sun: IC.sun,
    cloud: IC.cloud,
    rain: IC.rain,
    snow: IC.snow,
  };
  return (m[t] || IC.sun)({ sz, c: t === 'sun' ? '#fbbf24' : C.t2 });
};

interface GlassProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  gridArea?: string;
}

const Glass = ({ children, style = {}, onClick, gridArea }: GlassProps) => (
  <div
    onClick={onClick}
    style={{
      background: C.card,
      backdropFilter: C.blur,
      WebkitBackdropFilter: C.blur,
      borderRadius: C.r,
      border: `1px solid ${C.borderGlass}`,
      padding: 16,
      gridArea,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
      minHeight: 0,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
);

const ChevR = ({ sz = 14, c = C.t3 }: { sz?: number; c?: string }) => (
  <svg
    width={sz}
    height={sz}
    viewBox="0 0 24 24"
    fill="none"
    stroke={c}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

interface SideCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}

const SideCard = ({ icon, title, subtitle, onClick, children, style = {} }: SideCardProps) => (
  <div
    onClick={onClick}
    style={{
      background: C.card,
      backdropFilter: C.blur,
      WebkitBackdropFilter: C.blur,
      borderRadius: C.r,
      border: `1px solid ${C.borderGlass}`,
      boxShadow: `${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 14px 8px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: C.accentDim,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 9, fontWeight: 600, color: C.green, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
      {onClick && <ChevR />}
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 14px 14px', minHeight: 0 }}>
      {children}
    </div>
  </div>
);

interface CompactRowProps {
  icon: ReactNode;
  label: string;
  summary: ReactNode;
  accent?: string;
  onClick?: () => void;
}

const CompactRow = ({ icon, label, summary, accent, onClick }: CompactRowProps) => (
  <div
    onClick={onClick}
    style={{
      background: C.card,
      backdropFilter: C.blur,
      WebkitBackdropFilter: C.blur,
      borderRadius: 14,
      border: `1px solid ${C.borderGlass}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      flex: 1,
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: C.accentDim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ fontSize: 10, fontWeight: 700, color: C.t2, flexShrink: 0 }}>{label}</div>
    <div
      style={{
        flex: 1,
        fontSize: 11,
        fontWeight: 600,
        color: accent || C.t1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: 'right',
      }}
    >
      {summary}
    </div>
    {onClick && <ChevR sz={10} c={C.t3} />}
  </div>
);

/* ── Mock Data ── */
const ELEC_DATA = [3.2, 2.8, 4.1, 3.6, 5.2, 4.8, 3.9, 4.3, 5.1, 4.7, 3.5, 4.9, 5.6, 4.2];
const GAS_DATA = [1.1, 1.3, 1.5, 1.2, 1.4, 1.6, 1.3, 1.1, 1.4, 1.2, 1.5, 1.3, 1.4, 1.4];
const FORECAST_FALLBACK = [
  { d: 'Today', hi: 34, lo: 21, t: 'snow' },
  { d: 'Sat', hi: 28, lo: 17, t: 'snow' },
  { d: 'Sun', hi: 26, lo: 15, t: 'cloud' },
  { d: 'Mon', hi: 30, lo: 18, t: 'sun' },
  { d: 'Tue', hi: 33, lo: 20, t: 'sun' },
];
const FAMILY = [
  { name: 'Chris', color: C.accent },
  { name: 'Olivia', color: C.green },
  { name: 'Remi', color: C.purple },
  { name: 'Desmond', color: C.amber },
  { name: 'Merit', color: '#f472b6' },
];
const WATER_DATA = [42, 38, 55, 48, 61, 44, 48];

/* ── Detail Page Overlay ── */
interface DetailPageProps {
  title: string;
  icon: ReactNode;
  onBack: () => void;
  children: ReactNode;
}

const DetailPage = ({ title, icon, onBack, children }: DetailPageProps) => (
  <>
    {/* Backdrop — click to dismiss */}
    <div
      onClick={onBack}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(0,0,0,0.4)',
        animation: 'fi .15s ease',
      }}
    />
    {/* Floating panel */}
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        width: 'min(560px, 80vw)',
        maxHeight: '75vh',
        background: 'rgba(10,14,20,0.92)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${C.borderGlass}`,
        borderRadius: 22,
        boxShadow: '0 16px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        animation: 'fi .2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {IC.x({ sz: 16, c: C.t1 })}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>{children}</div>
    </div>
  </>
);

/* ── Doorbell Press Overlay ── */
/** Play a two-tone doorbell chime via Web Audio API */
function playDoorbellChime() {
  try {
    const ctx = new AudioContext();
    const playTone = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    // Classic ding-dong: E5 then C5
    playTone(659, 0, 0.6);
    playTone(523, 0.5, 0.8);
  } catch { /* AudioContext not available */ }
}

const DoorbellPress = ({ onClose, snapshotUrl }: { onClose: () => void; snapshotUrl?: string | null }) => {
  const [s, setS] = useState(0);
  const [imgSrc, setImgSrc] = useState<string | null>(snapshotUrl ?? null);

  // Play doorbell chime on mount
  useEffect(() => {
    playDoorbellChime();
  }, []);

  // Keep snapshot in sync with prop
  useEffect(() => {
    if (snapshotUrl) setImgSrc(snapshotUrl);
  }, [snapshotUrl]);

  // Auto-dismiss countdown
  useEffect(() => {
    const i = setInterval(() => {
      setS((v) => {
        if (v >= 30) {
          onClose();
          return v;
        }
        return v + 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        background: 'rgba(6,8,12,0.88)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fi .2s ease',
      }}
    >
      <div style={{ width: 'min(520px, 85vw)' }}>
        <Glass style={{ padding: 0 }}>
          <div
            style={{
              height: 300,
              background:
                'linear-gradient(180deg,rgba(22,27,36,0.9),rgba(10,15,20,0.95))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: `${C.r}px ${C.r}px 0 0`,
            }}
          >
            {imgSrc ? (
              <img src={imgSrc} alt="Front Door" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ opacity: 0.12, textAlign: 'center' }}>
                {IC.cam({ sz: 48, c: C.white })}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: `${C.red}18`,
                padding: '3px 10px',
                borderRadius: 8,
              }}
            >
              <Dot color={C.red} sz={5} />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: C.red,
                  letterSpacing: '0.1em',
                }}
              >
                LIVE
              </span>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'rgba(0,0,0,0.3)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: C.accent,
                  width: `${((30 - s) / 30) * 100}%`,
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>
          <div style={{ padding: '20px 24px 24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>Front Door</div>
                <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>
                  Doorbell pressed &middot; {s}s ago
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: C.accentDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {IC.bell({ sz: 20, c: C.accent })}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 14,
                background: C.accent,
                border: 'none',
                color: '#0a0f14',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: 10,
              }}
            >
              Dismiss
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${C.border}`,
                color: C.t1,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Open Ring App
            </button>
          </div>
        </Glass>
      </div>
    </div>
  );
};

/* ── Motion Banner ── */
const MotionBanner = ({ onClose, camera }: { onClose: () => void; camera?: string }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 150,
        animation: 'sd .3s ease',
      }}
    >
      <Glass
        style={{
          padding: '12px 18px',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          minWidth: 320,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: `${C.amber}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {IC.cam({ sz: 16, c: C.amber })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Motion Detected</div>
          <div style={{ fontSize: 10, color: C.t1 }}>{camera ?? 'Camera'}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          {IC.x({ sz: 14, c: C.t2 })}
        </button>
      </Glass>
    </div>
  );
};

/* ── Main Dashboard ── */
type PageId =
  | 'electricity'
  | 'gas'
  | 'water'
  | 'cameras'
  | 'calendar'
  | 'plants'
  | 'family'
  | 'commute'
  | 'music'
  | 'weather'
  | 'alerts'
  | 'meals';

export function HubPage() {
  const [time, setTime] = useState(new Date());
  const [db, setDb] = useState<string | null>(null);
  const [page, setPage] = useState<PageId | null>(null);
  const sp = useSpotify();
  const msgs = useMessages();
  const { plants, water: waterPlant, setWateredDate } = usePlants();
  const { events: calEvents } = useCalendar();
  const ring = useRing();
  const { plan: mealPlan } = useMealPlan();
  const [selectedRecipe, setSelectedRecipe] = useState<{ meal: Meal; dayLabel: string } | null>(null);
  const [expandedCam, setExpandedCam] = useState<string | null>(null);
  const urgentPlant = [...plants].sort((a, b) => a.daysUntil - b.daysUntil)[0] ?? null;
  const [plantUndo, setPlantUndo] = useState<Record<string, string>>({}); // entityId → previous ISO state
  const [spPos, setSpPos] = useState(0);
  const [showSpDevices, setShowSpDevices] = useState(false);
  const [showSpLibrary, setShowSpLibrary] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Live Spotify position tracker
  useEffect(() => {
    if (!sp.playing) { setSpPos(sp.position); return; }
    const tick = () => {
      const elapsed = (Date.now() - sp.updatedAt) / 1000;
      setSpPos(Math.min(sp.position + elapsed, sp.duration));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [sp.playing, sp.position, sp.updatedAt, sp.duration]);

  const closeDb = useCallback(() => setDb(null), []);
  const tStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
  const goBack = useCallback(() => { setPage(null); setSelectedRecipe(null); }, []);

  /* ── Live Weather ── */
  const { data: weather } = useWeather();
  const pirate = usePirateWeather();
  const nws = useNWSForecast();
  const { alerts } = useNWSAlerts();
  const wx = weather?.current;
  const topAlert = alerts[0] ?? null;

  // Build forecast: Open-Meteo temps, Pirate Weather conditions, NWS precip amounts
  // HA weather condition → icon type. Pirate Weather is more accurate than Open-Meteo for daily conditions.
  const pwCondMap: Record<string, string> = {
    snowy: 'snow', rainy: 'rain', pouring: 'rain', lightning: 'rain', 'lightning-rainy': 'rain',
    hail: 'rain', cloudy: 'cloud', partlycloudy: 'cloud', windy: 'cloud', 'windy-variant': 'cloud',
    fog: 'cloud', exceptional: 'cloud',
    sunny: 'sun', clear: 'sun', 'clear-night': 'sun',
  };
  const forecast = weather?.daily.slice(0, 5).map((d) => {
    // Match Pirate Weather by date, not index
    const pw = pirate.daily.find((p) => p.datetime.startsWith(d.date));
    // NWS snowfall is the authoritative source — fall back to Open-Meteo
    const nwsDay = nws.daily.find((n) => n.date === d.date);
    const snow = nwsDay?.snowfall ?? d.snowfallSum;
    const rain = nwsDay?.rain ?? d.rainSum;
    // Use Pirate Weather condition when available for that date, otherwise Open-Meteo
    const t = pw ? (pwCondMap[pw.condition] ?? wmoToType(d.weatherCode)) : wmoToType(d.weatherCode);
    return {
      d: d.day,
      hi: d.hi,
      lo: d.lo,
      t,
      snow,
      rain,
    };
  }) ?? FORECAST_FALLBACK.map((f) => ({ ...f, snow: 0, rain: 0 }));
  // Prefer Pirate Weather for current condition icon (more accurate during active precip)
  const pwConditionMap: Record<string, string> = { snowy: 'snow', rainy: 'rain', cloudy: 'cloud', partlycloudy: 'cloud', sunny: 'sun', clear: 'sun' };
  const wxIcon = pirate.available ? (pwConditionMap[pirate.precip.condition] ?? 'cloud') : wx ? wmoToType(wx.weatherCode) : 'snow';
  const wxTemp = wx?.temperature ?? 34;
  const wxHumidity = wx?.humidity ?? 55;
  const today = weather?.daily[0] ?? null;

  // Sunrise/sunset formatted as "7:12 AM"
  const fmtSunTime = (iso: string | undefined) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Wind direction degrees → compass label
  const windDir = (deg: number) => {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  // Build a friendly, conversational forecast narrative
  const todayNarrative = (() => {
    if (!today || !wx) return null;
    const desc = wmoToDescription(wx.weatherCode).toLowerCase();
    const feelsLike = Math.round(wx.apparentTemperature);
    const wind = Math.round(wx.windSpeed);
    const windMax = Math.round(today.windSpeedMax);
    const snow = forecast[0]?.snow ?? 0;
    const rain = forecast[0]?.rain ?? 0;
    const tonight = weather?.daily[1] ?? null;
    const tonightDesc = tonight ? wmoToDescription(tonight.weatherCode).toLowerCase() : null;

    const parts: string[] = [];

    // Opening — friendly tone based on conditions
    if (snow > 2) parts.push(`Heads up — we're looking at ${snow.toFixed(1)}" of snow today.`);
    else if (snow > 0.1) parts.push(`A little snow today, about ${snow.toFixed(1)}".`);
    else if (rain > 0.5) parts.push(`Grab an umbrella — ${rain.toFixed(1)}" of rain headed our way.`);
    else if (rain > 0.01) parts.push(`Some rain in the forecast, around ${rain < 0.1 ? 'a trace' : rain.toFixed(1) + '"'}.`);
    else if (desc.includes('clear') || desc.includes('sunny')) parts.push(`Looking like a nice one out there — ${desc} skies.`);
    else parts.push(`It's ${desc} right now.`);

    // Temperature context
    parts.push(`High of ${today.hi}°, low of ${today.lo}°.`);
    if (Math.abs(feelsLike - wxTemp) >= 5) {
      parts.push(feelsLike < wxTemp ? `Feels more like ${feelsLike}° with the wind chill though.` : `Feels warmer though, around ${feelsLike}°.`);
    }

    // Precip probability if not already covered
    if (snow <= 0.1 && rain <= 0.01 && today.precipProbability > 30) {
      parts.push(`There's a ${today.precipProbability}% chance of precipitation.`);
    }

    // Tonight
    if (tonight && tonightDesc) {
      parts.push(`Tonight: ${tonightDesc}, dropping to ${tonight.lo}°.`);
    }

    return parts.join(' ');
  })();

  // Precipitation timing badge from Pirate Weather hourly data
  const precipBadge = (() => {
    if (!pirate.available || pirate.hourly.length === 0) return null;
    const now = new Date();
    const isCurrentlyPrecip = pirate.precip.condition === 'snowy' || pirate.precip.condition === 'rainy';
    const type = pirate.precip.condition === 'snowy' ? 'snow' : 'rain';

    if (isCurrentlyPrecip) {
      // Find when precip stops
      const stopHour = pirate.hourly.find((h) => {
        const t = new Date(h.datetime);
        return t > now && h.condition !== 'snowy' && h.condition !== 'rainy';
      });
      if (stopHour) {
        const mins = Math.round((new Date(stopHour.datetime).getTime() - now.getTime()) / 60000);
        if (mins < 60) return { type, text: `${type === 'snow' ? 'Snow' : 'Rain'} stops in ~${mins}m` };
        const hrs = Math.round(mins / 60);
        return { type, text: `${type === 'snow' ? 'Snow' : 'Rain'} for ~${hrs}h more` };
      }
      return { type, text: `${type === 'snow' ? 'Snowing' : 'Raining'} now` };
    } else {
      // Find when precip starts
      const startHour = pirate.hourly.find((h) => {
        const t = new Date(h.datetime);
        return t > now && (h.condition === 'snowy' || h.condition === 'rainy');
      });
      if (startHour) {
        const mins = Math.round((new Date(startHour.datetime).getTime() - now.getTime()) / 60000);
        const startType = startHour.condition === 'snowy' ? 'snow' : 'rain';
        if (mins < 60) return { type: startType, text: `${startType === 'snow' ? 'Snow' : 'Rain'} in ~${mins}m` };
        const hrs = Math.round(mins / 60);
        if (hrs <= 6) return { type: startType, text: `${startType === 'snow' ? 'Snow' : 'Rain'} in ~${hrs}h` };
      }
      return null; // No precip expected soon
    }
  })();

  /* --- Detail page content --- */
  const pages: Record<string, ReactNode> = {
      electricity: (
        <DetailPage title="Electricity" icon={IC.zap({ sz: 20, c: C.accent })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                TODAY
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.accent }}>
                24.7 <span style={{ fontSize: 14, color: C.t1 }}>kWh</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Spark data={ELEC_DATA} color={C.accent} h={40} />
              </div>
            </Glass>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                BILL ESTIMATE
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>$127</div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>
                Due Mar 18 &middot; Xcel Energy
              </div>
            </Glass>
          </div>
        </DetailPage>
      ),
      gas: (
        <DetailPage title="Gas" icon={IC.flame({ sz: 20, c: C.amber })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                TODAY
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.amber }}>
                1.4 <span style={{ fontSize: 14, color: C.t1 }}>thm</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Spark data={GAS_DATA} color={C.amber} h={40} />
              </div>
            </Glass>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                BILL ESTIMATE
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>$48</div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>
                Due Mar 18 &middot; CenterPoint
              </div>
            </Glass>
          </div>
        </DetailPage>
      ),
      water: (
        <DetailPage title="Water" icon={IC.drop({ sz: 20, c: '#60a5fa' })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                TODAY
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa' }}>
                48 <span style={{ fontSize: 14, color: C.t1 }}>gal</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Spark data={WATER_DATA} color="#60a5fa" h={40} />
              </div>
            </Glass>
            <Glass>
              <div style={{ fontSize: 10, color: C.t2, fontWeight: 700, marginBottom: 4 }}>
                BILL ESTIMATE
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>$38</div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 4 }}>
                Due Mar 22 &middot; City of Chanhassen
              </div>
            </Glass>
          </div>
        </DetailPage>
      ),
      cameras: (() => {
        const expanded = expandedCam ? ring.cameras.find((c) => c.id === expandedCam) : null;
        return (
          <DetailPage
            title={expanded ? expanded.name : 'Ring Cameras'}
            icon={IC.cam({ sz: 20, c: C.accent })}
            onBack={() => { if (expandedCam) setExpandedCam(null); else goBack(); }}
          >
            {expanded ? (
              <div>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg,rgba(22,27,36,0.95),rgba(14,18,24,0.95))',
                    borderRadius: C.r,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {expanded.snapshotUrl ? (
                    <img src={expanded.snapshotUrl} alt={expanded.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      {IC.cam({ sz: 48, c: C.t3 })}
                    </div>
                  )}
                  {expanded.motionDetected && (
                    <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: `${C.amber}20`, padding: '4px 10px', borderRadius: 8 }}>
                      <Dot color={C.amber} sz={6} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.amber }}>MOTION</span>
                    </div>
                  )}
                  {expanded.isDoorbell && (
                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                      {IC.bell({ sz: 18, c: C.accent })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: C.t2 }}>
                  <span>{expanded.location}</span>
                  {expanded.battery !== null && (
                    <span style={{ color: expanded.battery < 20 ? C.red : C.t2 }}>
                      Battery: {expanded.battery}%
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>
                  Last activity: {expanded.lastActivity}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ring.cameras.map((cam) => (
                  <Glass key={cam.id} style={{ padding: 0, cursor: 'pointer' }} onClick={() => setExpandedCam(cam.id)}>
                    <div
                      style={{
                        height: 160,
                        background: 'linear-gradient(135deg,rgba(22,27,36,0.95),rgba(14,18,24,0.95))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        borderRadius: `${C.r}px ${C.r}px 0 0`,
                        overflow: 'hidden',
                      }}
                    >
                      {cam.snapshotUrl ? (
                        <img src={cam.snapshotUrl} alt={cam.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        IC.cam({ sz: 28, c: C.t3 })
                      )}
                      {cam.motionDetected && (
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, background: `${C.amber}20`, padding: '2px 8px', borderRadius: 6 }}>
                          <Dot color={C.amber} sz={4} />
                          <span style={{ fontSize: 8, fontWeight: 700, color: C.amber }}>MOTION</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Dot color={C.green} sz={6} />
                      </div>
                      {cam.isDoorbell && (
                        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                          {IC.bell({ sz: 14, c: C.accent })}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{cam.name}</div>
                      <div style={{ fontSize: 9, color: C.t2, marginTop: 1 }}>{cam.location}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        {cam.battery !== null && (
                          <span style={{ fontSize: 9, color: cam.battery < 20 ? C.red : C.t2 }}>
                            Battery: {cam.battery}%
                          </span>
                        )}
                        <span style={{ fontSize: 9, color: C.t2 }}>
                          Last: {cam.lastActivity}
                        </span>
                      </div>
                    </div>
                  </Glass>
                ))}
              </div>
            )}
          </DetailPage>
        );
      })(),
      calendar: (() => {
        const todayEvents = calEvents.filter(isToday);
        const upcomingEvents = calEvents.filter((e) => !isToday(e));
        return (
          <DetailPage title="Schedule" icon={IC.cal({ sz: 20, c: C.purple })} onBack={goBack}>
            {/* Today */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Today</div>
            <Glass>
              {todayEvents.length === 0 ? (
                <div style={{ padding: '12px 0', color: C.t2, fontSize: 13 }}>No events today</div>
              ) : (
                todayEvents.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < todayEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1, fontVariantNumeric: 'tabular-nums', width: 56, flexShrink: 0 }}>
                      {formatEventTime(e)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{e.summary}</span>
                      <span style={{ marginLeft: 6 }}><Pill color={calendarColor(e.calendar)}>{calendarLabel(e.calendar)}</Pill></span>
                      {e.location && <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{e.location}</div>}
                    </div>
                  </div>
                ))
              )}
            </Glass>

            {/* Upcoming */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 6 }}>Upcoming</div>
            <Glass>
              {upcomingEvents.length === 0 ? (
                <div style={{ padding: '12px 0', color: C.t2, fontSize: 13 }}>Nothing this week</div>
              ) : (
                upcomingEvents.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < upcomingEvents.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width: 80, flexShrink: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.accent }}>{formatEventDate(e)}</div>
                      <div style={{ fontSize: 11, color: C.t2 }}>{formatEventTime(e)}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{e.summary}</span>
                      <span style={{ marginLeft: 6 }}><Pill color={calendarColor(e.calendar)}>{calendarLabel(e.calendar)}</Pill></span>
                      {e.location && <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{e.location}</div>}
                    </div>
                  </div>
                ))
              )}
            </Glass>
          </DetailPage>
        );
      })(),
      plants: (
        <DetailPage title="Plant Care" icon={IC.leaf({ sz: 20, c: C.green })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {plants.map((p) => {
              const barColor = p.overdue ? C.red : p.needsWater ? C.amber : C.green;
              return (
                <Glass key={p.name}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: p.overdue ? C.red : p.needsWater ? C.amber : C.white,
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: C.t2, marginBottom: 8 }}>
                    Every {p.intervalDays} days
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Bar value={p.progress} color={barColor} h={6} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: p.overdue ? C.red : p.needsWater ? C.amber : C.t2 }}>
                      {p.overdue
                        ? `${p.daysSince - p.intervalDays}d overdue`
                        : p.daysUntil === 0
                          ? 'Water today'
                          : `${p.daysUntil}d until next`}
                    </span>
                    {plantUndo[p.entityId] ? (
                      <button
                        onClick={() => {
                          setWateredDate(p.entityId, new Date(plantUndo[p.entityId]));
                          setPlantUndo((prev) => { const n = { ...prev }; delete n[p.entityId]; return n; });
                        }}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${C.t2}`,
                          borderRadius: 6,
                          padding: '4px 10px',
                          color: C.t1,
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const prevDate = p.lastWatered?.toISOString() ?? '';
                          setPlantUndo((prev) => ({ ...prev, [p.entityId]: prevDate }));
                          waterPlant(p.entityId);
                          setTimeout(() => {
                            setPlantUndo((prev) => { const n = { ...prev }; delete n[p.entityId]; return n; });
                          }, 10000);
                        }}
                        style={{
                          background: barColor,
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          color: '#0a0f14',
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Water
                      </button>
                    )}
                  </div>
                  {p.lastWatered && (
                    <div style={{ fontSize: 9, color: C.t3, marginTop: 6 }}>
                      Last: {p.lastWatered.toLocaleDateString()}
                    </div>
                  )}
                </Glass>
              );
            })}
          </div>
        </DetailPage>
      ),
      family: (
        <DetailPage
          title="Family Messages"
          icon={IC.msg({ sz: 20, c: C.purple })}
          onBack={goBack}
        >
          {/* Broadcast composer */}
          <Glass style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, marginBottom: 8 }}>Send Broadcast</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('broadcast') as HTMLInputElement;
                if (input.value.trim()) {
                  msgs.sendBroadcast(input.value.trim());
                  input.value = '';
                }
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                name="broadcast"
                type="text"
                inputMode="text"
                autoComplete="off"
                enterKeyHint="send"
                placeholder="Message all screens…"
                maxLength={255}
                style={{
                  flex: 1,
                  background: C.well,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: C.white,
                  fontSize: 16,
                  outline: 'none',
                  WebkitAppearance: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: C.purple,
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: '#0a0f14',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </Glass>

          {/* Message history */}
          <Glass style={{ marginTop: 16 }}>
            {msgs.messages.length === 0 ? (
              <div style={{ fontSize: 12, color: C.t2, textAlign: 'center', padding: 16 }}>No messages yet</div>
            ) : (
              msgs.messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 0',
                    borderBottom: i < msgs.messages.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}
                >
                  <Dot color={m.color} sz={7} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.from}</span>
                      <span style={{ fontSize: 9, color: C.t2 }}>{timeAgo(m.lastChanged)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.t1, marginTop: 2 }}>{m.text}</div>
                  </div>
                </div>
              ))
            )}
          </Glass>
        </DetailPage>
      ),
      commute: (
        <DetailPage title="Commute" icon={IC.car({ sz: 20, c: C.accent })} onBack={goBack}>
          <Glass>
            <div style={{ fontSize: 11, color: C.t1, marginBottom: 4 }}>
              Downtown MPLS via I-494 E
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.green }}>
              32 <span style={{ fontSize: 16, color: C.t1 }}>min</span>
            </div>
            <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>Light traffic</div>
          </Glass>
        </DetailPage>
      ),
      music: (
        <DetailPage title="Now Playing" icon={IC.music({ sz: 20, c: C.accent })} onBack={goBack}>
          <Glass style={{ padding: 0 }}>
            {sp.albumArt ? (
              <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                <img src={sp.albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(12,16,22,0.9))' }} />
              </div>
            ) : (
              <div
                style={{
                  height: 200,
                  background: 'linear-gradient(135deg,rgba(26,26,46,0.8),rgba(22,33,62,0.8))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {IC.music({ sz: 48, c: C.t3 })}
              </div>
            )}
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{sp.title || 'Not Playing'}</div>
              {sp.artist && (
                <div style={{ fontSize: 12, color: C.t1, marginTop: 2 }}>
                  {sp.artist}{sp.album ? ` \u00b7 ${sp.album}` : ''}
                </div>
              )}
              {sp.idle && sp.sourceList.length > 0 && (
                <div style={{ marginTop: 16, fontSize: 12, color: C.t2, textAlign: 'center' }}>
                  Pick a speaker to start playing
                </div>
              )}
              {sp.duration > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Bar value={sp.duration ? spPos / sp.duration : 0} color={C.accent} h={4} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: C.t2 }}>{fmtTime(spPos)}</span>
                    <span style={{ fontSize: 10, color: C.t2 }}>{fmtTime(sp.duration)}</span>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 24,
                  marginTop: 16,
                  position: 'relative',
                }}
              >
                {/* Library icon — only when playing/paused */}
                {!sp.idle && (
                <button
                  onClick={() => { setShowSpLibrary(v => !v); setShowSpDevices(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    position: 'absolute',
                    left: 0,
                  }}
                >
                  {IC.library({ sz: 18, c: showSpLibrary ? C.accent : C.t2 })}
                </button>
                )}
                <button onClick={() => sp.prev()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {IC.prev({ sz: 18, c: C.t1 })}
                </button>
                <button
                  onClick={() => {
                    if (sp.idle) {
                      setShowSpDevices(true);
                    } else {
                      sp.playPause();
                    }
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    background: C.white,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,.3)',
                  }}
                >
                  {sp.playing
                    ? IC.pause({ sz: 16, c: '#0a0f14' })
                    : IC.play({ sz: 16, c: '#0a0f14' })}
                </button>
                <button onClick={() => sp.next()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  {IC.next({ sz: 18, c: C.t1 })}
                </button>
                {/* Device picker icon */}
                {sp.sourceList.length > 0 && (
                  <button
                    onClick={() => { setShowSpDevices(v => !v); setShowSpLibrary(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      position: 'absolute',
                      right: 0,
                    }}
                  >
                    {IC.speaker({ sz: 18, c: showSpDevices ? C.accent : C.t2 })}
                  </button>
                )}
              </div>
              {/* Device picker — auto-show when idle */}
              {(showSpDevices || sp.idle) && sp.sourceList.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sp.sourceList.map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        sp.selectSource(src);
                        setShowSpDevices(false);
                        // After selecting source, start playing liked songs
                        if (sp.idle) setTimeout(() => sp.playMedia('spotify:user:spotify:collection', 'spotify://'), 500);
                      }}
                      style={{
                        background: src === sp.source ? C.accentDim : 'transparent',
                        border: `1px solid ${src === sp.source ? C.accent : C.border}`,
                        borderRadius: 8,
                        padding: '8px 12px',
                        color: src === sp.source ? C.accent : C.t1,
                        fontSize: 11,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Glass>

          {/* Browse / Library */}
          {showSpLibrary && (
          <Glass style={{ padding: '16px 20px', marginTop: 16 }}>
            {sp.browseItems.length === 0 && !sp.browseLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Library</div>
                {[
                  { label: 'Recently Played', ct: 'spotify://current_user_recently_played' },
                  { label: 'Playlists', ct: 'spotify://current_user_playlists' },
                  { label: 'Liked Songs', ct: 'spotify://current_user_saved_tracks' },
                  { label: 'Podcasts', ct: 'spotify://current_user_saved_shows' },
                  { label: 'Top Artists', ct: 'spotify://current_user_top_artists' },
                  { label: 'Top Tracks', ct: 'spotify://current_user_top_tracks' },
                  { label: 'Artists', ct: 'spotify://current_user_followed_artists' },
                  { label: 'Albums', ct: 'spotify://current_user_saved_albums' },
                ].map((lib) => (
                  <button
                    key={lib.label}
                    onClick={() => sp.browse(lib.ct, lib.ct, lib.label)}
                    style={{
                      background: C.well,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: '12px 14px',
                      color: C.t1,
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {lib.label}
                    <ChevR sz={12} c={C.t2} />
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <button
                    onClick={() => {
                      if (sp.browsePath.length <= 1) {
                        // Reset to root
                        sp.browse();
                        // Clear items manually by browsing root which returns categories
                      } else {
                        sp.browseBack();
                      }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.t1 }}
                  >
                    {IC.prev({ sz: 14, c: C.t1 })}
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {sp.browsePath.length > 0 ? sp.browsePath[sp.browsePath.length - 1].title : 'Library'}
                  </div>
                </div>
                {sp.browseLoading ? (
                  <div style={{ textAlign: 'center', color: C.t2, fontSize: 12, padding: 20 }}>Loading…</div>
                ) : sp.browseError ? (
                  <div style={{ textAlign: 'center', color: C.amber, fontSize: 12, padding: 20 }}>{sp.browseError}</div>
                ) : sp.browseItems.length === 0 ? (
                  <div style={{ textAlign: 'center', color: C.t2, fontSize: 12, padding: 20 }}>No results</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 260, overflowY: 'auto' }}>
                    {sp.browseItems.map((item) => (
                      <button
                        key={item.media_content_id}
                        onClick={() => {
                          if (item.can_expand) {
                            sp.browse(item.media_content_id, item.media_content_type, item.title);
                          } else if (item.can_play) {
                            sp.playMedia(item.media_content_id, item.media_content_type);
                          }
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 6px',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          textAlign: 'left',
                        }}
                      >
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 6, background: C.well, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {IC.music({ sz: 16, c: C.t3 })}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: C.white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title}
                          </div>
                        </div>
                        {item.can_expand && <ChevR sz={12} c={C.t3} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Glass>
          )}
        </DetailPage>
      ),
      weather: (
        <DetailPage title="Weather" icon={IC.cloud({ sz: 20, c: C.accent })} onBack={goBack}>
          {weather ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Current conditions hero */}
              <Glass>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <WxI t={wxIcon} sz={48} />
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>
                      {wx?.temperature}&deg;
                    </div>
                    <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>
                      Feels like {wx?.apparentTemperature}&deg;F &middot; {wmoToDescription(wx?.weatherCode ?? 0)}
                    </div>
                  </div>
                </div>
              </Glass>

              {/* Detail grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>WIND</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{wx?.windSpeed}<span style={{ fontSize: 11, color: C.t2 }}> mph</span></div>
                </Glass>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>HUMIDITY</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{wx?.humidity}<span style={{ fontSize: 11, color: C.t2 }}>%</span></div>
                </Glass>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>DEW POINT</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{wx?.dewPoint}<span style={{ fontSize: 11, color: C.t2 }}>&deg;F</span></div>
                </Glass>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>UV INDEX</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: (wx?.uvIndex ?? 0) >= 6 ? C.red : (wx?.uvIndex ?? 0) >= 3 ? C.amber : C.green }}>
                    {wx?.uvIndex}
                  </div>
                </Glass>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>PRESSURE</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{wx?.pressure}<span style={{ fontSize: 11, color: C.t2 }}> hPa</span></div>
                </Glass>
                <Glass>
                  <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>VISIBILITY</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{wx?.visibility}<span style={{ fontSize: 11, color: C.t2 }}> mi</span></div>
                </Glass>
              </div>

              {/* Sunrise / Sunset */}
              {weather.daily[0] && (
                <Glass style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    {IC.sun({ sz: 20, c: C.amber })}
                    <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginTop: 4 }}>SUNRISE</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                      {new Date(weather.daily[0].sunrise).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ width: 1, height: 40, background: C.border }} />
                  <div style={{ textAlign: 'center' }}>
                    {IC.sun({ sz: 20, c: C.purple })}
                    <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginTop: 4 }}>SUNSET</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                      {new Date(weather.daily[0].sunset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </Glass>
              )}

              {/* 7-day forecast */}
              <Glass>
                <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>7-DAY FORECAST</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weather.daily.map((d) => (
                    <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, width: 40, color: d.day === 'Today' ? C.accent : C.t1 }}>{d.day}</span>
                      <WxI t={wmoToType(d.weatherCode)} sz={16} />
                      <span style={{ fontSize: 11, color: C.accent, width: 28, textAlign: 'right' }}>{d.precipProbability}%</span>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: C.t3, width: 24, textAlign: 'right' }}>{d.lo}&deg;</span>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                          <div style={{
                            position: 'absolute',
                            left: `${((d.lo - (weather.daily[weather.daily.length - 1]?.lo ?? d.lo)) / Math.max((weather.daily[0]?.hi ?? d.hi) - (weather.daily[weather.daily.length - 1]?.lo ?? d.lo), 1)) * 100}%`,
                            width: `${Math.max(((d.hi - d.lo) / Math.max((weather.daily[0]?.hi ?? d.hi) - (weather.daily[weather.daily.length - 1]?.lo ?? d.lo), 1)) * 100, 8)}%`,
                            height: '100%',
                            borderRadius: 2,
                            background: `linear-gradient(90deg, ${C.accent}, ${C.amber})`,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, width: 24 }}>{d.hi}&deg;</span>
                      </div>
                      <span style={{ fontSize: 10, color: C.t3, width: 50, textAlign: 'right' }}>{d.windSpeedMax} mph</span>
                    </div>
                  ))}
                </div>
              </Glass>

              {/* Hourly forecast */}
              <Glass>
                <div style={{ fontSize: 9, color: C.t3, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 12 }}>NEXT 24 HOURS</div>
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
                  {weather.hourly.map((h, i) => {
                    const hr = new Date(h.time).getHours();
                    const label = i === 0 ? 'Now' : hr === 0 ? '12a' : hr < 12 ? `${hr}a` : hr === 12 ? '12p' : `${hr - 12}p`;
                    return (
                      <div key={h.time} style={{ textAlign: 'center', flexShrink: 0, minWidth: 36 }}>
                        <div style={{ fontSize: 9, color: i === 0 ? C.accent : C.t3, fontWeight: 700 }}>{label}</div>
                        <div style={{ margin: '6px 0' }}><WxI t={wmoToType(h.weatherCode)} sz={14} /></div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{h.temperature}&deg;</div>
                        {h.precipProbability > 0 && (
                          <div style={{ fontSize: 9, color: C.accent, marginTop: 2 }}>{h.precipProbability}%</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Glass>

              <div style={{ fontSize: 10, color: C.t3, textAlign: 'center' }}>
                Updated {weather.lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} &middot; Open-Meteo
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: C.t2, padding: 40 }}>Loading weather data...</div>
          )}
        </DetailPage>
      ),
      alerts: (
        <DetailPage title="Weather Alerts" icon={IC.alert({ sz: 20, c: C.red })} onBack={goBack}>
          {alerts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {alerts.map((a, i) => {
                const severityColor = a.severity === 'Extreme' ? '#dc2626' : a.severity === 'Severe' ? C.red : a.severity === 'Moderate' ? C.amber : C.t2;
                return (
                  <Glass key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: severityColor,
                          boxShadow: `0 0 12px ${severityColor}40`,
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                          {a.severity.toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{a.event}</span>
                    </div>
                    {a.headline && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.t1, marginBottom: 10, lineHeight: 1.5 }}>
                        {a.headline}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        color: C.t2,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        background: C.well,
                        padding: 14,
                        borderRadius: 12,
                        maxHeight: 300,
                        overflowY: 'auto',
                      }}
                    >
                      {a.description}
                    </div>
                    {a.expires && (
                      <div style={{ fontSize: 10, color: C.t3, marginTop: 10 }}>
                        Expires: {new Date(a.expires).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}
                  </Glass>
                );
              })}
              <div style={{ fontSize: 10, color: C.t3, textAlign: 'center' }}>
                Source: National Weather Service
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: C.t2, padding: 40 }}>
              <div style={{ marginBottom: 8 }}>{IC.shield({ sz: 32, c: C.green })}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>All Clear</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>No active weather alerts for Victoria, MN</div>
            </div>
          )}
        </DetailPage>
      ),
      meals: (() => {
        // Recipe drill-down view
        if (selectedRecipe) {
          const { meal, dayLabel } = selectedRecipe;
          return (
            <DetailPage
              title={meal.name}
              icon={<Sv sz={20} c="#fb923c"><path d="M3 2h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /></Sv>}
              onBack={() => setSelectedRecipe(null)}
            >
              {/* Header info */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <Pill color={mealTypeColor(meal.type)}>{mealTypeLabel(meal.type)}</Pill>
                <Pill color={C.t2}>{dayLabel}</Pill>
                {meal.time && <Pill color={C.t2}>{meal.time}</Pill>}
                {meal.onHand && <Pill color={C.green}>All on hand</Pill>}
              </div>

              {/* Description */}
              {meal.description && (
                <Glass style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.6 }}>{meal.description}</div>
                  {meal.leftoverNote && (
                    <div style={{ fontSize: 11, color: C.amber, marginTop: 8, fontWeight: 600 }}>
                      Leftover tip: {meal.leftoverNote}
                    </div>
                  )}
                </Glass>
              )}

              {/* Ingredients */}
              {meal.ingredients.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                    Ingredients
                  </div>
                  <Glass style={{ marginBottom: 12 }}>
                    {meal.ingredients.map((ing, i) => {
                      const needsBuy = ing.includes('BUY');
                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 0',
                            borderBottom: i < meal.ingredients.length - 1 ? `1px solid ${C.border}` : 'none',
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              background: needsBuy ? C.amber : C.green,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 12, color: needsBuy ? C.t1 : C.t2 }}>
                            {ing.replace(' (BUY)', '').replace(' (on hand)', '')}
                          </span>
                          {needsBuy && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: C.amber, marginLeft: 'auto' }}>BUY</span>
                          )}
                        </div>
                      );
                    })}
                  </Glass>
                </>
              )}

              {/* Steps */}
              {meal.steps.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                    Steps
                  </div>
                  <Glass>
                    {meal.steps.map((step, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: 10,
                          padding: '8px 0',
                          borderBottom: i < meal.steps.length - 1 ? `1px solid ${C.border}` : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            background: 'rgba(251,146,60,0.15)',
                            color: '#fb923c',
                            fontSize: 10,
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 12, color: C.t1, lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                  </Glass>
                </>
              )}

              {/* Toppings bar (for hot dogs etc) */}
              {meal.toppings && meal.toppings.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: 'uppercase', letterSpacing: 1, marginTop: 12, marginBottom: 6 }}>
                    Toppings Bar
                  </div>
                  <Glass>
                    {meal.toppings.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 0',
                          borderBottom: i < (meal.toppings?.length ?? 0) - 1 ? `1px solid ${C.border}` : 'none',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{t.items}</div>
                      </div>
                    ))}
                  </Glass>
                </>
              )}
            </DetailPage>
          );
        }

        // Weekly meal plan overview
        return (
          <DetailPage
            title="Meal Plan"
            icon={<Sv sz={20} c="#fb923c"><path d="M3 2h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /></Sv>}
            onBack={goBack}
          >
            {mealPlan ? (
              <>
                <div style={{ fontSize: 11, color: C.t2, marginBottom: 12 }}>
                  Week of {mealPlan.week}
                </div>
                {mealPlan.days.map((day, di) => {
                  const isCurrentDay = (() => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    return day.date === todayStr;
                  })();

                  return (
                    <div key={di} style={{ marginBottom: 16 }}>
                      {/* Day header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                      }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: isCurrentDay ? '#fb923c' : C.t1,
                        }}>
                          {day.label}
                        </div>
                        {isCurrentDay && <Pill color="#fb923c">Today</Pill>}
                        {day.note && (
                          <span style={{ fontSize: 10, color: C.t3, fontStyle: 'italic' }}>
                            {day.note.length > 50 ? day.note.slice(0, 50) + '…' : day.note}
                          </span>
                        )}
                      </div>

                      {/* Meals for the day */}
                      <Glass style={{ padding: 0 }}>
                        {day.meals.map((meal, mi) => (
                          <div
                            key={mi}
                            onClick={() => {
                              if (!meal.special || meal.steps.length > 0) {
                                setSelectedRecipe({ meal, dayLabel: day.label });
                              }
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderBottom: mi < day.meals.length - 1 ? `1px solid ${C.border}` : 'none',
                              cursor: meal.special && meal.steps.length === 0 ? 'default' : 'pointer',
                            }}
                          >
                            {/* Meal type indicator dot */}
                            <div style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              background: mealTypeColor(meal.type),
                              flexShrink: 0,
                            }} />

                            {/* Meal type label */}
                            <div style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: mealTypeColor(meal.type),
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              width: 40,
                              flexShrink: 0,
                            }}>
                              {mealTypeLabel(meal.type)}
                            </div>

                            {/* Meal name */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.t1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {meal.emoji ? `${meal.emoji} ` : ''}{meal.name}
                              </div>
                            </div>

                            {/* Time & status badges */}
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                              {meal.time && (
                                <span style={{ fontSize: 9, color: C.t3, fontWeight: 600 }}>{meal.time}</span>
                              )}
                              {meal.onHand && (
                                <div style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: 3,
                                  background: C.green,
                                }} />
                              )}
                            </div>

                            {/* Chevron for clickable meals */}
                            {(!meal.special || meal.steps.length > 0) && <ChevR sz={10} c={C.t3} />}
                          </div>
                        ))}
                      </Glass>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: C.t2, padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>No Meal Plan</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>A new plan will appear here Sunday evening</div>
              </div>
            )}
          </DetailPage>
        );
      })(),
    };

  /* --- Main Grid Layout --- */
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: `url(${BG}) center/cover no-repeat`,
        fontFamily: '"DM Sans",-apple-system,system-ui,sans-serif',
        color: C.white,
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto repeat(4, 1fr)',
        gridTemplateAreas:
          '"header header header header" "weather weather schedule cameras" "weather weather meals plants" "elec gas water commute" "spotify spotify family family"',
        gap: 10,
        padding: '0 8px 8px',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"
        rel="stylesheet"
      />
      <style>{`@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes sd{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}*{-webkit-tap-highlight-color:transparent;user-select:none;box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}button{font-family:inherit}button:active{opacity:.85!important}`}</style>

      {/* HEADER */}
      <header
        style={{
          gridArea: 'header',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '12px 12px 8px',
          background: 'rgba(10,15,20,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: C.accentDim,
              border: `1px solid rgba(45,212,191,0.2)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {IC.home({ sz: 20, c: C.accent })}
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>The Axelson&apos;s</span>
        </div>
        <span
          style={{
            fontSize: 32,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          {tStr}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {topAlert && (
              <div
                onClick={() => setPage('alerts')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: topAlert.severity === 'Extreme' ? '#dc2626' : topAlert.severity === 'Severe' ? C.red : C.amber,
                  padding: '6px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  boxShadow: topAlert.severity === 'Extreme'
                    ? '0 0 16px rgba(220,38,38,0.5)'
                    : '0 0 12px rgba(248,113,113,0.4)',
                  animation: topAlert.severity === 'Extreme' ? 'pulse 2s ease-in-out infinite' : undefined,
                }}
                title={topAlert.headline}
              >
                {IC.alert({ sz: 13, c: '#fff' })}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  {topAlert.event}
                </span>
                {alerts.length > 1 && (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
                    +{alerts.length - 1}
                  </span>
                )}
              </div>
            )}
            <Glass
              style={{
                padding: '7px 14px',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderRadius: 14,
              }}
            >
              <WxI t={wxIcon} sz={16} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>{wxTemp}&deg;F</span>
              <span style={{ color: C.t3 }}>&middot;</span>
              {IC.drop({ sz: 14, c: C.accent })}
              <span style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{wxHumidity}%</span>
            </Glass>
          </div>
          <button
            onClick={() => setDb('press')}
            style={{
              background: 'rgba(12,16,22,0.5)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.borderGlass}`,
              borderRadius: 12,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {IC.bell({ sz: 16, c: C.t1 })}
          </button>
          <button
            onClick={() => setDb('motion')}
            style={{
              background: 'rgba(12,16,22,0.5)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${C.borderGlass}`,
              borderRadius: 12,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {IC.cam({ sz: 16, c: C.t1 })}
          </button>
        </div>
      </header>

      {/* WEATHER — 2×2 bento tile */}
      <Glass
        gridArea="weather"
        onClick={() => setPage('weather')}
        style={{ padding: 20, justifyContent: 'space-between', cursor: 'pointer', gap: 6 }}
      >
        {/* Top row: current conditions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <WxI t={wxIcon} sz={36} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>{wxTemp}&deg;F</div>
              <div style={{ fontSize: 15, color: C.t1, marginTop: 4 }}>
                {wx ? wmoToDescription(wx.weatherCode) : 'Loading\u2026'} &middot; {wxHumidity}% humidity
              </div>
            </div>
          </div>
          {/* Sun times + UV + Wind — single row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.white, fontWeight: 600, letterSpacing: '0.05em' }}>SUNRISE</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.amber }}>{fmtSunTime(today?.sunrise)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.white, fontWeight: 600, letterSpacing: '0.05em' }}>SUNSET</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fb923c' }}>{fmtSunTime(today?.sunset)}</div>
            </div>
            <div style={{ width: 1, height: 28, background: C.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.white, fontWeight: 600, letterSpacing: '0.05em' }}>UV INDEX</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: (today?.uvIndexMax ?? 0) >= 6 ? C.red : (today?.uvIndexMax ?? 0) >= 3 ? C.amber : C.green }}>
                {today?.uvIndexMax != null ? Math.round(today.uvIndexMax) : '--'}
                <span style={{ fontSize: 12, fontWeight: 600, color: C.t2, marginLeft: 4 }}>
                  {(today?.uvIndexMax ?? 0) >= 8 ? 'Very High' : (today?.uvIndexMax ?? 0) >= 6 ? 'High' : (today?.uvIndexMax ?? 0) >= 3 ? 'Moderate' : 'Low'}
                </span>
              </div>
            </div>
            <div style={{ width: 1, height: 28, background: C.border }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.white, fontWeight: 600, letterSpacing: '0.05em' }}>WIND</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.t1 }}>
                {wx ? `${Math.round(wx.windSpeed)}` : '--'}
                <span style={{ fontSize: 12, fontWeight: 600, color: C.t2 }}> mph {wx ? windDir(wx.windDirection) : ''}</span>
              </div>
              {today && Math.round(today.windSpeedMax) > Math.round(wx?.windSpeed ?? 0) + 5 && (
                <div style={{ fontSize: 12, color: C.t3, marginTop: 1 }}>Gusts to {Math.round(today.windSpeedMax)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Forecast narrative + precip badge */}
        <div>
          {precipBadge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(20,80,70,0.75)',
                border: '1px solid rgba(45,212,191,0.5)',
                borderRadius: 10,
                padding: '8px 14px',
                marginBottom: 8,
              }}
            >
              <WxI t={precipBadge.type} sz={18} />
              <span style={{ fontSize: 15, fontWeight: 800, color: '#5eead4' }}>{precipBadge.text}</span>
            </div>
          )}
          {todayNarrative && (
            <div style={{ fontSize: 16, color: C.t1, lineHeight: 1.55 }}>
              {todayNarrative}
            </div>
          )}
        </div>

        {/* 5-day forecast */}
        <div style={{ display: 'flex', gap: 8 }}>
          {forecast.map((f) => (
            <div
              key={f.d}
              style={{
                flex: 1,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '10px 6px 12px',
              }}
            >
              <div style={{ fontSize: 13, color: C.white, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>
                {f.d.toUpperCase()}
              </div>
              <WxI t={f.t} sz={26} />
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{f.hi}&deg;</div>
              <div style={{ fontSize: 14, color: C.t3 }}>{f.lo}&deg;</div>
              {f.snow > 0.1 ? (
                <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600, marginTop: 4 }}>
                  {f.snow.toFixed(1)}&quot;
                </div>
              ) : f.rain > 0.01 ? (
                <div style={{ fontSize: 13, color: C.accent, fontWeight: 600, marginTop: 4 }}>
                  {f.rain < 0.1 ? '<0.1' : f.rain.toFixed(1)}&quot;
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Glass>

      {/* SCHEDULE tile */}
      <Glass
        gridArea="schedule"
        onClick={() => setPage('calendar')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {IC.cal({ sz: 18, c: C.purple })}
          <span style={{ fontSize: 15, fontWeight: 700 }}>Schedule</span>
          <div style={{ flex: 1 }} />
          <ChevR sz={16} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {calEvents.length === 0 ? (
            <div style={{ fontSize: 14, color: C.t2 }}>No events</div>
          ) : (
            calEvents.slice(0, 3).map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < Math.min(calEvents.length, 3) - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <div style={{ width: 4, borderRadius: 2, background: calendarColor(e.calendar), flexShrink: 0, alignSelf: 'stretch' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.summary}
                  </div>
                  <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>
                    {isToday(e) ? formatEventTime(e) : `${formatEventDate(e)} ${formatEventTime(e)}`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Glass>

      {/* CAMERAS tile */}
      <Glass
        gridArea="cameras"
        onClick={() => setPage('cameras')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {IC.cam({ sz: 18, c: C.accent })}
          <span style={{ fontSize: 15, fontWeight: 700 }}>Cameras</span>
          <div style={{ flex: 1 }} />
          <ChevR sz={16} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: ring.anyMotion ? C.amber : C.green, marginBottom: 6 }}>
          {ring.anyMotion ? 'Motion' : `${ring.onlineCount} Online`}
        </div>
        {ring.anyMotion && ring.motionCamera && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Dot color={C.amber} sz={7} />
            <span style={{ fontSize: 14, color: C.amber, fontWeight: 600 }}>{ring.motionCamera.name}</span>
          </div>
        )}
        <div style={{ flex: 1 }}>
          {ring.cameras.slice(0, 4).map((cam) => (
            <div key={cam.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
              <Dot color={cam.motionDetected ? C.amber : C.green} sz={6} />
              <span style={{ fontSize: 13, color: C.t1 }}>{cam.name}</span>
            </div>
          ))}
        </div>
      </Glass>

      {/* MEALS tile */}
      <Glass
        gridArea="meals"
        onClick={() => setPage('meals')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Sv sz={18} c="#fb923c"><path d="M3 2h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" /></Sv>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Meals</span>
          <div style={{ flex: 1 }} />
          <ChevR sz={16} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {(() => {
            const todayMeals = getTodayMeals(mealPlan);
            const next = getNextMeal(mealPlan);
            if (todayMeals.length === 0 && !next) return <div style={{ fontSize: 14, color: C.t2 }}>No meal plan</div>;
            return todayMeals.length > 0 ? todayMeals.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < todayMeals.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: mealTypeColor(m.type), textTransform: 'uppercase', width: 60, flexShrink: 0 }}>{mealTypeLabel(m.type)}</span>
                <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
              </div>
            )) : next ? (
              <div>
                <div style={{ fontSize: 13, color: C.t2, marginBottom: 4 }}>{next.dayLabel}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{next.meal.name}</div>
              </div>
            ) : null;
          })()}
        </div>
      </Glass>

      {/* PLANTS tile */}
      <Glass
        gridArea="plants"
        onClick={() => setPage('plants')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {IC.leaf({ sz: 18, c: C.green })}
          <span style={{ fontSize: 15, fontWeight: 700 }}>Plants</span>
          <div style={{ flex: 1 }} />
          <ChevR sz={16} />
        </div>
        {urgentPlant ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: urgentPlant.overdue ? C.red : urgentPlant.needsWater ? C.amber : C.white, marginBottom: 8 }}>
              {urgentPlant.name}
            </div>
            <Bar value={urgentPlant.progress} color={urgentPlant.overdue ? C.red : urgentPlant.needsWater ? C.amber : C.green} h={6} />
            <div style={{ fontSize: 14, color: urgentPlant.overdue ? C.red : urgentPlant.needsWater ? C.amber : C.t2, marginTop: 8 }}>
              {urgentPlant.overdue
                ? `${urgentPlant.daysSince - urgentPlant.intervalDays}d overdue`
                : urgentPlant.daysUntil === 0
                  ? 'Water today'
                  : `${urgentPlant.daysUntil}d until next`}
            </div>
            {plants.length > 1 && (
              <div style={{ fontSize: 13, color: C.t3, marginTop: 4 }}>+{plants.length - 1} more</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 15, color: C.green }}>All plants happy</div>
        )}
      </Glass>

      {/* ELECTRICITY tile */}
      <Glass
        gridArea="elec"
        onClick={() => setPage('electricity')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {IC.zap({ sz: 16, c: C.accent })}
          <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}>ELECTRICITY</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: C.accent }}>24.7</span>
          <span style={{ fontSize: 14, color: C.t1 }}>kWh</span>
        </div>
        <div style={{ marginTop: 8, flex: 1 }}>
          <Spark data={ELEC_DATA} color={C.accent} h={28} />
        </div>
        <div style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>
          Est. <span style={{ fontWeight: 700, color: C.t1 }}>$127</span>
          <span style={{ color: C.t3 }}> /mo</span>
        </div>
      </Glass>

      {/* GAS tile */}
      <Glass
        gridArea="gas"
        onClick={() => setPage('gas')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {IC.flame({ sz: 16, c: C.amber })}
          <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}>GAS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: C.amber }}>1.4</span>
          <span style={{ fontSize: 14, color: C.t1 }}>thm</span>
        </div>
        <div style={{ marginTop: 8, flex: 1 }}>
          <Spark data={GAS_DATA} color={C.amber} h={28} />
        </div>
        <div style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>
          Est. <span style={{ fontWeight: 700, color: C.t1 }}>$48</span>
          <span style={{ color: C.t3 }}> /mo</span>
        </div>
      </Glass>

      {/* WATER tile */}
      <Glass
        gridArea="water"
        onClick={() => setPage('water')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {IC.drop({ sz: 16, c: '#60a5fa' })}
          <span style={{ fontSize: 13, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}>WATER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#60a5fa' }}>48</span>
          <span style={{ fontSize: 14, color: C.t1 }}>gal</span>
        </div>
        <div style={{ marginTop: 8, flex: 1 }}>
          <Spark data={WATER_DATA} color="#60a5fa" h={28} />
        </div>
        <div style={{ fontSize: 13, color: C.t2, marginTop: 6 }}>
          Est. <span style={{ fontWeight: 700, color: C.t1 }}>$38</span>
          <span style={{ color: C.t3 }}> /mo</span>
        </div>
      </Glass>

      {/* COMMUTE tile */}
      <Glass
        gridArea="commute"
        onClick={() => setPage('commute')}
        style={{ padding: 16, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {IC.car({ sz: 18, c: C.accent })}
          <span style={{ fontSize: 15, fontWeight: 700 }}>Commute</span>
        </div>
        <div style={{ fontSize: 14, color: C.t1, marginBottom: 4 }}>Downtown MPLS</div>
        <div>
          <span style={{ fontSize: 36, fontWeight: 800, color: C.green }}>32</span>
          <span style={{ fontSize: 14, color: C.t1, marginLeft: 4 }}>min</span>
        </div>
        <div style={{ fontSize: 13, color: C.green, marginTop: 4 }}>Light traffic</div>
      </Glass>

      {/* SPOTIFY — 2-column tile */}
      <div
        onClick={() => setPage('music')}
        style={{
          gridArea: 'spotify',
          background: C.card,
          backdropFilter: C.blur,
          WebkitBackdropFilter: C.blur,
          borderRadius: C.r,
          border: `1px solid ${C.borderGlass}`,
          overflow: 'hidden',
          display: 'flex',
          cursor: 'pointer',
        }}
      >
        {sp.albumArt ? (
          <div style={{ width: 180, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            <img src={sp.albumArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, rgba(12,16,22,0.8))' }} />
          </div>
        ) : (
          <div style={{ width: 180, flexShrink: 0, background: 'linear-gradient(135deg,rgba(26,26,46,0.6),rgba(22,33,62,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {IC.music({ sz: 36, c: C.t3 })}
          </div>
        )}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sp.title || 'Not Playing'}
          </div>
          {sp.artist && (
            <div style={{ fontSize: 14, color: C.t1, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sp.artist}{sp.album ? ` \u00b7 ${sp.album}` : ''}
            </div>
          )}
          {sp.duration > 0 && (
            <div style={{ marginTop: 12, maxWidth: 300 }}>
              <Bar value={sp.duration ? spPos / sp.duration : 0} color={C.accent} h={4} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 11, color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(spPos)}</span>
                <span style={{ fontSize: 11, color: C.t2, fontVariantNumeric: 'tabular-nums' }}>{fmtTime(sp.duration)}</span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 10 }}>
            <button onClick={(e) => { e.stopPropagation(); sp.prev(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {IC.prev({ sz: 18, c: C.t1 })}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); sp.playPause(); }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                background: C.white,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.3)',
              }}
            >
              {sp.playing ? IC.pause({ sz: 16, c: '#0a0f14' }) : IC.play({ sz: 16, c: '#0a0f14' })}
            </button>
            <button onClick={(e) => { e.stopPropagation(); sp.next(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              {IC.next({ sz: 18, c: C.t1 })}
            </button>
          </div>
        </div>
      </div>

      {/* FAMILY — 2-column tile */}
      <Glass
        gridArea="family"
        onClick={() => setPage('family')}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 20, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          {FAMILY.map((f) => (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: `${f.color}20`,
                  border: `2px solid ${f.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700 }}>{f.name[0]}</span>
                <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 5, background: C.green, border: '2px solid rgba(10,15,20,0.8)' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{f.name}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0, borderLeft: `1px solid ${C.border}`, paddingLeft: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {IC.msg({ sz: 16, c: C.purple })}
            <span style={{ fontSize: 15, fontWeight: 700 }}>Messages</span>
          </div>
          {(() => {
            const recent = msgs.messages[0];
            if (!recent) return <div style={{ fontSize: 14, color: C.t2 }}>No messages yet</div>;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Dot color={recent.color} sz={7} />
                <span style={{ fontSize: 14, fontWeight: 600, color: recent.color }}>{recent.from}:</span>
                <span style={{ fontSize: 14, color: C.t1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recent.text}</span>
                <span style={{ fontSize: 12, color: C.t3, flexShrink: 0 }}>{timeAgo(recent.lastChanged)}</span>
              </div>
            );
          })()}
        </div>
        <ChevR sz={16} />
      </Glass>

      {(db === 'press' || ring.doorbellPressed) && <DoorbellPress onClose={() => { closeDb(); ring.dismissDoorbell(); }} snapshotUrl={ring.cameras[0]?.snapshotUrl} />}
      {(db === 'motion' || ring.motionAlert) && <MotionBanner onClose={() => { closeDb(); ring.dismissMotion(); }} camera={ring.motionAlert ?? undefined} />}

      {/* Detail page modal */}
      {page && pages[page]}
    </div>
  );
}
