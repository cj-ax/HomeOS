/**
 * App — Router Shell
 * 
 * Each tablet bookmarks its own route on the home network:
 *   Fire HD 10 (common area) → http://pi-ip:5173/hub
 *   Emma's Fire HD 8         → http://pi-ip:5173/emma
 *   Jake's Fire HD 8         → http://pi-ip:5173/jake
 *   Youngest's Fire HD 8     → http://pi-ip:5173/youngest
 * 
 * No login, no auth — if you're on the LAN, you're in.
 * The HomeAssistantProvider wraps everything so every page
 * has access to the shared HA WebSocket connection.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomeAssistantProvider } from '@/context/HomeAssistantContext';
import { HubPage } from '@/pages/HubPage';
import { EmmaPage } from '@/pages/EmmaPage';
import { JakePage } from '@/pages/JakePage';
import { YoungestPage } from '@/pages/YoungestPage';

export function App() {
  return (
    <HomeAssistantProvider>
      <BrowserRouter>
        <Routes>
          {/* Main family hub — Fire HD 10 */}
          <Route path="/hub" element={<HubPage />} />
          
          {/* Kid dashboards — Fire HD 8 tablets */}
          <Route path="/emma" element={<EmmaPage />} />
          <Route path="/jake" element={<JakePage />} />
          <Route path="/youngest" element={<YoungestPage />} />
          
          {/* Default: redirect to hub */}
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Routes>
      </BrowserRouter>
    </HomeAssistantProvider>
  );
}
