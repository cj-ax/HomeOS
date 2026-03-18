# Home OS — Project Blueprint

## What This Is

A custom smart home dashboard for a family of five. The Raspberry Pi 5 runs Home Assistant headless as the data/API engine. The frontend is a standalone React + TypeScript app displayed on Amazon Fire tablets around the house. This is NOT a Home Assistant dashboard — HA is invisible to the user. The React app IS the product.

Think of it like this: Home Assistant is the engine under the hood. This React app is the dashboard, steering wheel, and everything the family actually sees and touches.

---

## Hardware Map

| Device                  | Role                   | Screen      | Location       |
| ----------------------- | ---------------------- | ----------- | -------------- |
| Raspberry Pi 5 (4GB)    | HA backend (headless)  | None        | Closet/utility |
| Fire HD 10 (13th Gen)   | Main family hub        | 10.1" 1080p | Common area    |
| Fire HD 8 #1 (12th Gen) | Kid dashboard — Age 11 | 8" 800p     | Bedroom        |
| Fire HD 8 #2 (12th Gen) | Kid dashboard — Age 9  | 8" 800p     | Bedroom        |
| Fire HD 8 #3 (12th Gen) | Kid dashboard — Age 7  | 8" 800p     | Bedroom        |

**Touch targets**: Minimum 48px on all devices. The 7-year-old's interface uses 64px+ targets.

---

## Architecture

```
[Fire Tablets — React App in Fully Kiosk Browser or Firefox]
        |
        | WebSocket (home-assistant-js-websocket)
        |
[Raspberry Pi 5 — Home Assistant Core]
        |
        |--- Ring Integration (doorbell events + snapshots)
        |--- Spotify Integration (media_player entities per user)
        |--- Google Calendar Integration
        |--- Google Maps API (commute times)
        |--- IMAP Bill Scraper (Python, runs on Pi)
        |--- HA Companion App (notifications to parent phone)
        |--- Google Mini (TTS broadcasts + voice command listeners)
```

### Key Architectural Decisions

- **No authentication on routes** — device is on home LAN, each tablet bookmarks its own route
- **HA is the message bus** — inter-screen communication (chore updates, parent broadcasts, bedtime lock) all flow through HA entities/events
- **WebSocket-first** — all data is real-time subscriptions, no polling
- **Single React app, multiple routes** — not separate builds per screen

---

## Tech Stack

| Layer         | Technology                            | Why                                          |
| ------------- | ------------------------------------- | -------------------------------------------- |
| Framework     | React 18 + TypeScript                 | Component model fits per-screen architecture |
| Routing       | React Router v6                       | `/hub`, `/emma`, `/jake`, `/youngest`        |
| HA Connection | home-assistant-js-websocket           | Official lib, handles auth + subscriptions   |
| Styling       | Inline styles + CSS custom properties | Glassmorphism design via constants object    |
| Build         | Vite                                  | Fast HMR, good for Pi development            |

---

## Design System

### Theme: Dark Glassmorphism

- **Background**: Photo background with overlay (#0a0f14 base), base64 JPEG in `src/assets/bg.txt`
- **Cards**: `background: rgba(12,16,22,0.55)` with `backdrop-filter: blur(16px)`, border `rgba(255,255,255,0.15)`
- **Accent palette**: Teal primary (#2dd4bf), Green (#4ade80), Amber (#fbbf24), Red (#f87171), Purple (#c4b5fd), Blue (#60a5fa)
- **Typography**: DM Sans (Google Fonts) with system fallback
- **Radius**: 18px cards/glass panels
- **Shadows**: `0 4px 20px rgba(0,0,0,0.3)` + inset highlight `inset 0 1px 0 rgba(255,255,255,0.06)`
- **Color constants**: Defined in `C` object in HubPage.tsx — single source of truth for all colors

### Touch Targets

- Default: 48px minimum
- Kid (age 7): 64px minimum
- All interactive elements have visible focus/active states

---

## Route Map

| Route      | Screen     | Description                                |
| ---------- | ---------- | ------------------------------------------ |
| `/hub`     | Fire HD 10 | Main family dashboard — grid widget layout |
| `/remi`    | Fire HD 8  | Age 11 — near-adult interface              |
| `/desmond` | Fire HD 8  | Age 9 — gamified with points               |
| `/merit`   | Fire HD 8  | Age 7 — giant icons, bedtime countdown     |

---

## Hub Layout (Grid-based widget dashboard)

The hub uses a CSS Grid layout: `"header header" "hero sidebar" "family sidebar"`

### Header Bar

- Home icon + title + location (Victoria, MN)
- Weather alert banner (e.g. Winter Storm Warning)
- Current conditions (temp, humidity) in Glass pill
- Live clock (24h format)
- Doorbell + camera buttons (trigger overlays)

### Hero Area (left column)

- **Floating utility widgets** (top): Electricity, Gas, Water — each with sparkline charts, click for detail page
- **Forecast** (bottom-left): 5-day weather with icons
- **Commute** (bottom-right): Drive time to Downtown MPLS

### Right Sidebar

- **Ring Cameras**: Camera status list with motion indicators
- **Plants**: Soil moisture bars per plant
- **Schedule**: Calendar events with time + tags
- **Family Messages**: Recent messages with colored dots
- **Spotify Player**: Album art, progress bar, playback controls

### Family Bar (bottom)

- Family member avatars with online status indicators

### Detail Pages (state-driven overlays, not routes)

- Electricity, Gas, Water, Cameras, Calendar, Plants, Family Messages, Commute, Music
- Triggered by widget clicks, dismissed by back button

---

## Doorbell Overlay (applies to ALL screens)

**Trigger**: Ring doorbell event via HA WebSocket

- **Doorbell press**: Full-screen glassmorphism overlay with camera placeholder, Dismiss + Open Ring buttons, 30s countdown timer
- **Motion detected**: Top banner notification (floating Glass card), non-blocking, auto-dismiss after 8s
- This is NOT a live video stream — entity_picture snapshots only. Live video requires go2rtc (future)

---

## Inter-Screen Communication (all via HA)

| Feature               | Mechanism                                                        |
| --------------------- | ---------------------------------------------------------------- |
| Parent broadcast      | HA fires custom event → all screens subscribed via WS            |
| Kid → Parent message  | HA service call → Companion App notification                     |
| Chore completion      | HA entity state change → all screens see update via WS           |
| Bedtime lock          | HA input_boolean per child → kid screen listens + dims           |
| Leaderboard           | HA sensor entities with point totals → all kid screens subscribe |
| Google Mini broadcast | HA TTS service call triggered from React button                  |

---

## Build Phases

### Phase 1: Foundation (DONE)

- [x] Project scaffold (Vite + React + TS)
- [x] Routing setup (React Router)
- [x] HA WebSocket connection hook
- [x] CSS custom properties design system
- [x] claude.md (this file)

### Phase 2: Hub Visual Shell (DONE)

- [x] Grid-based widget layout (header / hero+sidebar / family bar)
- [x] Glassmorphism Glass component with inline styles
- [x] SVG icon system (IC object)
- [x] Reusable primitives: Dot, Pill, Bar, Spark (sparkline), SideCard
- [x] Utility widgets (Electricity, Gas, Water) with sparkline charts
- [x] Weather forecast + commute widgets
- [x] Right sidebar (Ring Cameras, Plants, Schedule, Family, Spotify)
- [x] Family member bar with avatars
- [x] Detail page overlay system (state-driven, all 9 pages)
- [x] Doorbell press overlay with 30s countdown
- [x] Motion banner with 8s auto-dismiss
- [x] Live clock display
- [x] Mock data for all widgets

### Phase 3: Wire Up HA Data (widgets → live data)

- [ ] Weather widget → HA weather entity
- [ ] Electricity widget → HA energy sensor
- [ ] Gas widget → HA gas sensor
- [ ] Water widget → HA water sensor
- [x] Calendar widget → Google Calendar via HA REST API, 3 calendars
- [ ] Commute widget → Google Maps API via HA sensor
- [x] Ring cameras → 4 cameras (2 accounts), entity_picture snapshots, doorbell/motion overlays
- [ ] Plants → HA soil moisture sensors
- [x] Spotify → HA media_player entity, browse/play/device switching

### Phase 4: Security Features

- [ ] Motion zone status indicators
- [ ] Arm/disarm toggle
- [ ] Sprinkler zone controls with countdown timers

### Phase 5: Family & Communication

- [ ] Broadcast message composer
- [ ] Chore overview (all kids)
- [ ] Kid screen status indicators
- [ ] Bedtime lock toggles
- [ ] Bill tracking from IMAP scraper entities

### Phase 9: Kid Dashboard — Age 11 (Emma)

- [ ] Spotify integration (own account)
- [ ] Chore list with streak counter
- [ ] Calendar/homework reminders
- [ ] Weather card
- [ ] One-tap message to parent

### Phase 10: Kid Dashboard — Age 9 (Jake)

- [ ] Chore list with points system
- [ ] Family leaderboard
- [ ] Countdown timers to events
- [ ] Spotify card
- [ ] One-tap messaging

### Phase 11: Kid Dashboard — Age 7 (Youngest)

- [ ] Giant icon buttons (Music, Chores, Call Mom/Dad, Bedtime)
- [ ] Bedtime color countdown (green → yellow → red)
- [ ] Album art Spotify with big play/pause
- [ ] Morning greeting screen (time-triggered)

### Phase 12: Inter-Screen Communication

- [ ] Parent broadcast system
- [ ] Kid → parent notifications
- [ ] Real-time chore sync
- [ ] Bedtime lock/dim system
- [ ] Google Mini integration (TTS + voice triggers)

### Phase 13: Polish & Deploy

- [ ] Performance optimization for Fire tablets
- [ ] Kiosk mode configuration
- [ ] Error boundaries and offline handling
- [ ] Final touch target audit

---

## Important Constraints

- **Fire HD 8 has 2GB RAM** — keep bundle size lean, avoid heavy dependencies
- **Fire tablets run Fire OS (Android fork)** — test in Silk Browser or Fully Kiosk Browser
- **No external font CDN calls** — system fonts only for performance
- **All HA communication is WebSocket** — no REST polling
- **HA Long-Lived Access Token** stored in environment variable, never committed

---

## File Structure

```
home-os/
├── claude.md                    ← You are here
├── public/
├── src/
│   ├── main.tsx                 ← App entry point
│   ├── App.tsx                  ← Router setup
│   ├── context/
│   │   └── HomeAssistantContext.tsx  ← HA connection provider
│   ├── hooks/
│   │   ├── useHomeAssistant.ts  ← Hook to access HA context
│   │   ├── useEntity.ts        ← Subscribe to a single HA entity
│   │   ├── useCalendar.ts      ← Google Calendar via HA REST API
│   │   └── useRing.ts          ← Ring cameras (4), snapshots, doorbell/motion events
│   ├── assets/
│   │   ├── bg.txt               ← Base64 background image
│   │   └── bg.ts                ← Background image export
│   ├── components/
│   │   ├── common/
│   │   │   └── Card.tsx         ← Glassmorphism card (used by kid pages)
│   │   ├── hub/                 ← Hub-specific components (future extraction)
│   │   ├── kids/                ← Kid dashboard components (future)
│   │   └── doorbell/            ← Doorbell overlay (future)
│   ├── pages/
│   │   ├── HubPage.tsx          ← Main hub (grid widget dashboard + detail pages)
│   │   ├── EmmaPage.tsx         ← Age 11 dashboard
│   │   ├── JakePage.tsx         ← Age 9 dashboard
│   │   └── YoungestPage.tsx     ← Age 7 dashboard
│   ├── styles/
│   │   ├── globals.css          ← CSS custom properties, resets
│   │   └── theme.ts             ← Theme constants for JS usage
│   └── utils/
│       └── ha.ts                ← HA helper functions
├── .env.example                 ← Template for HA connection vars
├── package.json
├── tsconfig.json
└── vite.config.ts
```
