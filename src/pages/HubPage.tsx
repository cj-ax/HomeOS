/**
 * HubPage — Main Family Dashboard
 * Grid-based widget layout with glassmorphism design.
 * Source of truth: smart-home-dashboard.jsx
 */

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react';
import { BG } from '@/assets/bg';
import { useWeather, wmoToType, wmoToDescription } from '@/hooks/useWeather';
import { usePirateWeather } from '@/hooks/usePirateWeather';

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
      boxShadow: `${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
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
const CAMERAS = [
  { id: 'doorbell', n: 'Doorbell', loc: 'Front Door', motion: false },
  { id: 'front', n: 'Front Yard', loc: 'Driveway', motion: true },
  { id: 'backyard', n: 'Backyard', loc: 'Patio', motion: false },
];
const EVENTS = [
  { t: '9:00', title: 'Sprint Review', tag: 'Summit' },
  { t: '12:30', title: 'Lunch w/ Tyler', tag: undefined },
  { t: '3:00', title: 'Design Critique', tag: 'Summit' },
];
const PLANTS = [
  { n: 'Monstera', m: 0.72 },
  { n: 'Columnar Cactus', m: 0.55 },
  { n: 'Peruvian Apple Cactus', m: 0.48 },
  { n: 'Prickly Pear', m: 0.31 },
  { n: 'Euphorbia', m: 0.65 },
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
  <div
    style={{
      position: 'absolute',
      inset: 0,
      zIndex: 100,
      background: 'rgba(6,8,12,0.92)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'fi .2s ease',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {IC.back({ sz: 18, c: C.t1 })}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
      </div>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>{children}</div>
  </div>
);

/* ── Doorbell Press Overlay ── */
const DoorbellPress = ({ onClose }: { onClose: () => void }) => {
  const [s, setS] = useState(0);

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
      <div style={{ width: 400 }}>
        <Glass style={{ padding: 0 }}>
          <div
            style={{
              height: 200,
              background:
                'linear-gradient(180deg,rgba(22,27,36,0.9),rgba(10,15,20,0.95))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div style={{ opacity: 0.12, textAlign: 'center' }}>
              {IC.cam({ sz: 48, c: C.white })}
            </div>
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
const MotionBanner = ({ onClose }: { onClose: () => void }) => {
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
          <div style={{ fontSize: 10, color: C.t1 }}>Front Yard Camera</div>
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
  | 'weather';

export function HubPage() {
  const [time, setTime] = useState(new Date());
  const [playing, setPlaying] = useState(true);
  const [prog, setProg] = useState(0.37);
  const [db, setDb] = useState<string | null>(null);
  const [page, setPage] = useState<PageId | null>(null);

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setProg((p) => (p >= 1 ? 0 : p + 0.002)), 150);
    return () => clearInterval(i);
  }, [playing]);

  const closeDb = useCallback(() => setDb(null), []);
  const tStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
  const goBack = useCallback(() => setPage(null), []);

  /* ── Live Weather ── */
  const { data: weather } = useWeather();
  const pirate = usePirateWeather();
  const wx = weather?.current;

  // Build forecast: use Open-Meteo for temps/codes, overlay Pirate Weather precip when available
  const forecast = weather?.daily.slice(0, 5).map((d, i) => {
    const pw = pirate.daily[i];
    const isSnow = pw ? pw.condition === 'snowy' : d.snowfallSum > 0;
    // Pirate Weather gives liquid precip — multiply by 10 for snow estimate
    const snow = pw ? (pw.condition === 'snowy' ? pw.precipitation * 10 : 0) : d.snowfallSum;
    const rain = pw ? (pw.condition !== 'snowy' ? pw.precipitation : 0) : d.rainSum;
    return {
      d: d.day,
      hi: d.hi,
      lo: d.lo,
      t: isSnow ? 'snow' : wmoToType(d.weatherCode),
      snow,
      rain,
    };
  }) ?? FORECAST_FALLBACK.map((f) => ({ ...f, snow: 0, rain: 0 }));
  // Prefer Pirate Weather for current condition icon (more accurate during active precip)
  const pwConditionMap: Record<string, string> = { snowy: 'snow', rainy: 'rain', cloudy: 'cloud', partlycloudy: 'cloud', sunny: 'sun', clear: 'sun' };
  const wxIcon = pirate.available ? (pwConditionMap[pirate.precip.condition] ?? 'cloud') : wx ? wmoToType(wx.weatherCode) : 'snow';
  const wxTemp = wx?.temperature ?? 34;
  const wxHumidity = wx?.humidity ?? 55;

  /* --- Detail page content --- */
  if (page) {
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
      cameras: (
        <DetailPage title="Ring Cameras" icon={IC.cam({ sz: 20, c: C.accent })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {CAMERAS.map((cam) => (
              <Glass key={cam.id} style={{ padding: 0 }}>
                <div
                  style={{
                    height: 140,
                    background:
                      'linear-gradient(135deg,rgba(22,27,36,0.95),rgba(14,18,24,0.95))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: `${C.r}px ${C.r}px 0 0`,
                  }}
                >
                  {IC.cam({ sz: 28, c: C.t3 })}
                  {cam.motion && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: `${C.amber}20`,
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      <Dot color={C.amber} sz={4} />
                      <span style={{ fontSize: 8, fontWeight: 700, color: C.amber }}>MOTION</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Dot color={C.green} sz={6} />
                  </div>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{cam.n}</div>
                  <div style={{ fontSize: 9, color: C.t2, marginTop: 1 }}>{cam.loc}</div>
                </div>
              </Glass>
            ))}
          </div>
        </DetailPage>
      ),
      calendar: (
        <DetailPage title="Schedule" icon={IC.cal({ sz: 20, c: C.purple })} onBack={goBack}>
          <Glass>
            {EVENTS.map((e, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom:
                    i < EVENTS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.t1,
                    fontVariantNumeric: 'tabular-nums',
                    width: 48,
                    flexShrink: 0,
                  }}
                >
                  {e.t}
                </span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{e.title}</span>
                  {e.tag && (
                    <span style={{ marginLeft: 6 }}>
                      <Pill color={C.purple}>{e.tag}</Pill>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Glass>
        </DetailPage>
      ),
      plants: (
        <DetailPage title="Plant Moisture" icon={IC.leaf({ sz: 20, c: C.green })} onBack={goBack}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {PLANTS.map((p) => (
              <Glass key={p.n}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: p.m < 0.35 ? C.amber : C.white,
                    marginBottom: 8,
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: p.m < 0.35 ? C.amber : C.green,
                  }}
                >
                  {Math.round(p.m * 100)}%
                </div>
                <div style={{ marginTop: 8 }}>
                  <Bar value={p.m} color={p.m < 0.35 ? C.amber : C.green} h={6} />
                </div>
                {p.m < 0.35 && (
                  <div style={{ fontSize: 9, color: C.amber, marginTop: 6, fontWeight: 600 }}>
                    Needs water
                  </div>
                )}
              </Glass>
            ))}
          </div>
        </DetailPage>
      ),
      family: (
        <DetailPage
          title="Family Messages"
          icon={IC.msg({ sz: 20, c: C.purple })}
          onBack={goBack}
        >
          <Glass>
            {[
              { from: 'Broadcast', text: 'Pizza night — 6 PM!', time: '2m', c: C.purple },
              { from: 'Remi', text: 'Finished dishwasher \u2713', time: '14m', c: C.green },
              { from: 'Desmond', text: 'Screen time?', time: '22m', c: C.accent },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                }}
              >
                <Dot color={m.c} sz={7} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.c }}>{m.from}</span>
                    <span style={{ fontSize: 9, color: C.t2 }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.t1, marginTop: 2 }}>{m.text}</div>
                </div>
              </div>
            ))}
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
            <div
              style={{
                height: 200,
                background:
                  'linear-gradient(135deg,rgba(26,26,46,0.8),rgba(22,33,62,0.8))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {IC.music({ sz: 48, c: C.t3 })}
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Midnight City</div>
              <div style={{ fontSize: 12, color: C.t1, marginTop: 2 }}>
                M83 &middot; Hurry Up, We're Dreaming
              </div>
              <div style={{ marginTop: 16 }}>
                <Bar value={prog} color={C.accent} h={4} />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}
                >
                  <span style={{ fontSize: 10, color: C.t2 }}>1:32</span>
                  <span style={{ fontSize: 10, color: C.t2 }}>4:03</span>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 24,
                  marginTop: 16,
                }}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {IC.prev({ sz: 18, c: C.t1 })}
                </button>
                <button
                  onClick={() => setPlaying(!playing)}
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
                  {playing
                    ? IC.pause({ sz: 16, c: '#0a0f14' })
                    : IC.play({ sz: 16, c: '#0a0f14' })}
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {IC.next({ sz: 18, c: C.t1 })}
                </button>
              </div>
            </div>
          </Glass>
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
    };

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
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"
          rel="stylesheet"
        />
        <style>{`@keyframes fi{from{opacity:0}to{opacity:1}}*{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}`}</style>
        {pages[page] || pages.electricity}
      </div>
    );
  }

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
        gridTemplateColumns: '220px 1fr 310px',
        gridTemplateRows: 'auto 1fr auto auto auto',
        gridTemplateAreas: '"header header header" "utils hero sidebar" "weather hero sidebar" "commute hero sidebar" "family family family"',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap"
        rel="stylesheet"
      />
      <style>{`@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes sd{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}*{-webkit-tap-highlight-color:transparent;user-select:none;box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:2px}button{font-family:inherit}button:active{opacity:.85!important}`}</style>

      {/* HEADER */}
      <header
        style={{
          gridArea: 'header',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px 8px 16px',
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
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Smart Home</div>
            <div style={{ fontSize: 11, color: C.t1 }}>Victoria, MN</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: C.red,
                padding: '6px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                boxShadow: '0 0 12px rgba(248,113,113,0.4)',
              }}
            >
              {IC.alert({ sz: 13, c: '#fff' })}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '0.02em',
                }}
              >
                Winter Storm Warning
              </span>
            </div>
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
              <span style={{ fontSize: 14, fontWeight: 700 }}>{wxTemp}&deg;F</span>
              <span style={{ color: C.t3 }}>&middot;</span>
              {IC.drop({ sz: 14, c: C.accent })}
              <span style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{wxHumidity}%</span>
            </Glass>
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {tStr}
          </span>
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

      {/* UTILITY WIDGETS — stacked left column */}
      <div
        style={{
          gridArea: 'utils',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '8px 6px 10px 10px',
          overflow: 'hidden',
        }}
      >
        {/* Electricity */}
        <Glass
          onClick={() => setPage('electricity')}
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {IC.zap({ sz: 13, c: C.accent })}
            <span
              style={{ fontSize: 10, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}
            >
              ELECTRICITY
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>24.7</span>
            <span style={{ fontSize: 10, color: C.t1 }}>kWh</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <Spark data={ELEC_DATA} color={C.accent} h={18} />
          </div>
          <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>
            Est.{' '}
            <span style={{ fontWeight: 700, color: C.t1 }}>$127</span>
            <span style={{ color: C.t3 }}> /mo</span>
          </div>
        </Glass>

        {/* Gas */}
        <Glass
          onClick={() => setPage('gas')}
          style={{ animation: 'float 6s ease-in-out infinite 0.5s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {IC.flame({ sz: 13, c: C.amber })}
            <span
              style={{ fontSize: 10, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}
            >
              GAS
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>1.4</span>
            <span style={{ fontSize: 10, color: C.t1 }}>thm</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <Spark data={GAS_DATA} color={C.amber} h={18} />
          </div>
          <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>
            Est.{' '}
            <span style={{ fontWeight: 700, color: C.t1 }}>$48</span>
            <span style={{ color: C.t3 }}> /mo</span>
          </div>
        </Glass>

        {/* Water */}
        <Glass
          onClick={() => setPage('water')}
          style={{ animation: 'float 6s ease-in-out infinite 1s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {IC.drop({ sz: 13, c: '#60a5fa' })}
            <span
              style={{ fontSize: 10, fontWeight: 700, color: C.t1, letterSpacing: '0.06em' }}
            >
              WATER
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>48</span>
            <span style={{ fontSize: 10, color: C.t1 }}>gal</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <Spark data={WATER_DATA} color="#60a5fa" h={18} />
          </div>
          <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>
            Est.{' '}
            <span style={{ fontWeight: 700, color: C.t1 }}>$38</span>
            <span style={{ color: C.t3 }}> /mo</span>
          </div>
        </Glass>

      </div>

      {/* HERO — background image area */}
      <div style={{ gridArea: 'hero', position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
      </div>

      {/* Forecast */}
      <div style={{ gridArea: 'weather', padding: '0 6px 0 10px' }}>
        <Glass onClick={() => setPage('weather')} style={{ animation: 'float 6s ease-in-out infinite 1s', cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {forecast.map((f) => (
              <div key={f.d} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 8,
                    color: C.t2,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    marginBottom: 4,
                  }}
                >
                  {f.d.toUpperCase()}
                </div>
                <WxI t={f.t} />
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{f.hi}&deg;</div>
                {f.snow > 0.1 ? (
                  <div style={{ fontSize: 9, color: '#93c5fd', fontWeight: 600, marginTop: 2 }}>
                    {f.snow.toFixed(1)}&quot;
                  </div>
                ) : f.rain > 0.01 ? (
                  <div style={{ fontSize: 9, color: C.accent, fontWeight: 600, marginTop: 2 }}>
                    {f.rain < 0.1 ? '<0.1' : f.rain.toFixed(1)}&quot;
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Glass>
      </div>

      {/* Commute */}
      <div style={{ gridArea: 'commute', padding: '8px 6px 0 10px' }}>
        <Glass
          onClick={() => setPage('commute')}
          style={{ animation: 'float 6s ease-in-out infinite 2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {IC.car({ sz: 16, c: C.accent })}
            <div>
              <div style={{ fontSize: 10, color: C.t1 }}>Downtown MPLS</div>
              <div style={{ marginTop: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: C.green }}>32</span>
                <span style={{ fontSize: 10, color: C.t1, marginLeft: 3 }}>min</span>
              </div>
            </div>
          </div>
        </Glass>
      </div>

      {/* FAMILY BAR */}
      <div
        style={{
          gridArea: 'family',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 16px',
          background: 'rgba(10,15,20,0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {FAMILY.map((f) => (
          <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: `${f.color}20`,
                border: `2px solid ${f.color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700 }}>{f.name[0]}</span>
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  background: C.green,
                  border: '2px solid rgba(10,15,20,0.8)',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{f.name}</div>
              <div style={{ fontSize: 9, color: C.green, fontWeight: 600 }}>Home</div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDEBAR */}
      <aside
        style={{
          gridArea: 'sidebar',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '8px 10px 10px 6px',
          overflow: 'hidden',
          background: 'rgba(10,15,20,0.3)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Ring Cameras */}
        <SideCard
          icon={IC.cam({ sz: 13, c: C.accent })}
          title="Ring Cameras"
          subtitle="3 Online"
          onClick={() => setPage('cameras')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CAMERAS.map((cam) => (
              <div
                key={cam.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Dot color={C.green} sz={5} />
                  <span style={{ fontSize: 10, color: C.t1 }}>{cam.n}</span>
                </div>
                {cam.motion ? (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: C.amber,
                      background: `${C.amber}15`,
                      padding: '1px 6px',
                      borderRadius: 4,
                    }}
                  >
                    MOTION
                  </span>
                ) : (
                  <span style={{ fontSize: 8, color: C.t3 }}>Clear</span>
                )}
              </div>
            ))}
          </div>
        </SideCard>

        {/* Plants */}
        <SideCard
          icon={IC.leaf({ sz: 13, c: C.green })}
          title="Plants"
          onClick={() => setPage('plants')}
        >
          {PLANTS.map((p, i) => (
            <div key={p.n} style={{ marginBottom: i < PLANTS.length - 1 ? 6 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: p.m < 0.35 ? C.amber : C.t1 }}>{p.n}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: p.m < 0.35 ? C.amber : C.t2,
                  }}
                >
                  {Math.round(p.m * 100)}%
                </span>
              </div>
              <Bar value={p.m} color={p.m < 0.35 ? C.amber : C.green} h={3} />
            </div>
          ))}
        </SideCard>

        {/* Calendar */}
        <SideCard
          icon={IC.cal({ sz: 13, c: C.purple })}
          title="Schedule"
          onClick={() => setPage('calendar')}
        >
          {EVENTS.map((e, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                padding: '4px 0',
                borderBottom:
                  i < EVENTS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.t1,
                  fontVariantNumeric: 'tabular-nums',
                  width: 36,
                  flexShrink: 0,
                }}
              >
                {e.t}
              </span>
              <div>
                <span style={{ fontSize: 10, fontWeight: 600 }}>{e.title}</span>
                {e.tag && (
                  <span style={{ marginLeft: 4 }}>
                    <Pill color={C.purple}>{e.tag}</Pill>
                  </span>
                )}
              </div>
            </div>
          ))}
        </SideCard>

        {/* Messages */}
        <SideCard
          icon={IC.msg({ sz: 13, c: C.purple })}
          title="Family"
          onClick={() => setPage('family')}
        >
          {[
            { from: 'Broadcast', text: 'Pizza night — 6 PM!', time: '2m', c: C.purple },
            { from: 'Remi', text: 'Finished dishwasher \u2713', time: '14m', c: C.green },
            { from: 'Desmond', text: 'Screen time?', time: '22m', c: C.accent },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 6,
                padding: '4px 0',
                borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
              }}
            >
              <Dot color={m.c} sz={5} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: m.c }}>{m.from}</span>
                  <span style={{ fontSize: 8, color: C.t2 }}>{m.time}</span>
                </div>
                <div style={{ fontSize: 10, color: C.t1, marginTop: 1 }}>{m.text}</div>
              </div>
            </div>
          ))}
        </SideCard>

        {/* Spotify */}
        <div
          onClick={() => setPage('music')}
          style={{
            background: C.card,
            backdropFilter: C.blur,
            WebkitBackdropFilter: C.blur,
            borderRadius: C.r,
            border: `1px solid ${C.borderGlass}`,
            boxShadow: `${C.shadow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
            overflow: 'hidden',
            marginTop: 'auto',
            flex: '0 0 auto',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              height: 100,
              background:
                'linear-gradient(135deg,rgba(26,26,46,0.6),rgba(22,33,62,0.6))',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {IC.music({ sz: 28, c: C.t3 })}
          </div>
          <div style={{ padding: '12px 14px 16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Midnight City</div>
                <div style={{ fontSize: 10, color: C.t1, marginTop: 2 }}>
                  M83 &middot; Hurry Up, We're Dreaming
                </div>
              </div>
              <ChevR />
            </div>
            <div style={{ marginTop: 8 }}>
              <Bar value={prog} color={C.accent} h={3} />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}
              >
                <span
                  style={{ fontSize: 8, color: C.t2, fontVariantNumeric: 'tabular-nums' }}
                >
                  1:32
                </span>
                <span
                  style={{ fontSize: 8, color: C.t2, fontVariantNumeric: 'tabular-nums' }}
                >
                  4:03
                </span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                marginTop: 8,
              }}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                {IC.prev({ sz: 14, c: C.t1 })}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPlaying(!playing);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: C.white,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.3)',
                }}
              >
                {playing
                  ? IC.pause({ sz: 12, c: '#0a0f14' })
                  : IC.play({ sz: 12, c: '#0a0f14' })}
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                {IC.next({ sz: 14, c: C.t1 })}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {db === 'press' && <DoorbellPress onClose={closeDb} />}
      {db === 'motion' && <MotionBanner onClose={closeDb} />}
    </div>
  );
}
