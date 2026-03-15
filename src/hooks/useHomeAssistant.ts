import { useContext } from 'react';
import { HomeAssistantContext, type HomeAssistantContextValue } from '@/context/HomeAssistantContext';

/**
 * Hook to access the shared Home Assistant connection and entity state.
 */
export function useHomeAssistant(): HomeAssistantContextValue {
  return useContext(HomeAssistantContext);
}
