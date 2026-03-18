/**
 * App — Router Shell
 *
 * Each tablet bookmarks its own route on the home network:
 *   Fire HD 10 (common area) → http://pi-ip:5173/hub
 *   Remi's Fire HD 8          → http://pi-ip:5173/remi
 *   Desmond's Fire HD 8       → http://pi-ip:5173/desmond
 *   Merit's Fire HD 8         → http://pi-ip:5173/merit
 *
 * No login, no auth — if you're on the LAN, you're in.
 * The HomeAssistantProvider wraps everything so every page
 * has access to the shared HA WebSocket connection.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeAssistantProvider } from '@/context/HomeAssistantContext';
import { HubPage } from '@/pages/HubPage';
import { RemiPage } from '@/pages/RemiPage';
import { DesmondPage } from '@/pages/DesmondPage';
import { MeritPage } from '@/pages/MeritPage';

export function App() {
  return (
    <HomeAssistantProvider>
      <BrowserRouter>
        <Routes>
          {/* Main family hub — Fire HD 10 */}
          <Route path="/hub" element={<HubPage />} />

          {/* Kid dashboards — Fire HD 8 tablets */}
          <Route path="/remi" element={<RemiPage />} />
          <Route path="/desmond" element={<DesmondPage />} />
          <Route path="/merit" element={<MeritPage />} />

          {/* Default: redirect to hub */}
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </BrowserRouter>
    </HomeAssistantProvider>
  );
}
