/**
 * useSpotify — Spotify playback via Home Assistant media_player entity
 *
 * Subscribes to the HA media_player entity for real-time playback state.
 * Provides service calls for play/pause, next, previous, seek, and volume.
 */

import { useCallback, useMemo, useState } from 'react';
import { useEntity } from './useEntity';
import { useHomeAssistant } from './useHomeAssistant';
import { callService } from '@/utils/ha';

const DEFAULT_ENTITY_ID = 'media_player.desmon_d_spotify';

export interface MediaItem {
  title: string;
  thumbnail: string | null;
  media_content_id: string;
  media_content_type: string;
  can_play: boolean;
  can_expand: boolean;
  children_media_class?: string;
}

const HA_HTTP = import.meta.env.VITE_HA_URL?.replace(/^ws/, 'http').replace(/\/$/, '') ?? '';

export interface SpotifyState {
  available: boolean;
  playing: boolean;
  paused: boolean;
  idle: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  duration: number; // seconds
  position: number; // seconds
  volume: number; // 0-1
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  source: string; // active device name
  sourceList: string[];
  updatedAt: number; // timestamp of last HA update
}

export function useSpotify(entityId: string = DEFAULT_ENTITY_ID) {
  const entity = useEntity(entityId);
  const { connection } = useHomeAssistant();

  const state: SpotifyState = useMemo(() => {
    if (!entity || entity.state === 'unavailable') {
      return {
        available: false,
        playing: false,
        paused: false,
        idle: true,
        title: '',
        artist: '',
        album: '',
        albumArt: null,
        duration: 0,
        position: 0,
        volume: 0,
        shuffle: false,
        repeat: 'off',
        source: '',
        sourceList: [],
        updatedAt: 0,
      };
    }

    const a = entity.attributes;
    return {
      available: true,
      playing: entity.state === 'playing',
      paused: entity.state === 'paused',
      idle: entity.state === 'idle' || entity.state === 'off',
      title: (a.media_title as string) ?? '',
      artist: (a.media_artist as string) ?? '',
      album: (a.media_album_name as string) ?? '',
      albumArt: a.entity_picture
        ? `${import.meta.env.VITE_HA_URL?.replace(/^ws/, 'http').replace(/\/$/, '')}${a.entity_picture}`
        : null,
      duration: (a.media_duration as number) ?? 0,
      position: (a.media_position as number) ?? 0,
      volume: (a.volume_level as number) ?? 0,
      shuffle: (a.shuffle as boolean) ?? false,
      repeat: ((a.repeat as string) ?? 'off') as 'off' | 'all' | 'one',
      source: (a.source as string) ?? '',
      sourceList: (a.source_list as string[]) ?? [],
      updatedAt: a.media_position_updated_at
        ? new Date(a.media_position_updated_at as string).getTime()
        : 0,
    };
  }, [entity]);

  const call = useCallback(
    (service: string, data?: Record<string, unknown>) => {
      if (!connection) return;
      callService(connection, 'media_player', service, data, {
        entity_id: entityId,
      });
    },
    [connection]
  );

  const playPause = useCallback(() => call('media_play_pause'), [call]);
  const next = useCallback(() => call('media_next_track'), [call]);
  const prev = useCallback(() => call('media_previous_track'), [call]);
  const setVolume = useCallback(
    (level: number) => call('volume_set', { volume_level: level }),
    [call]
  );
  const setShuffle = useCallback(
    (on: boolean) => call('shuffle_set', { shuffle: on }),
    [call]
  );
  const setRepeat = useCallback(
    (mode: 'off' | 'all' | 'one') => call('repeat_set', { repeat: mode }),
    [call]
  );
  const selectSource = useCallback(
    (source: string) => call('select_source', { source }),
    [call]
  );

  const [browseItems, setBrowseItems] = useState<MediaItem[]>([]);
  const [browsePath, setBrowsePath] = useState<{ id: string; type: string; title: string }[]>([]);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);

  const browse = useCallback(
    async (mediaContentId?: string, mediaContentType?: string, title?: string) => {
      if (!connection) return;
      setBrowseLoading(true);
      setBrowseError(null);
      try {
        const msg = {
          type: 'media_player/browse_media' as const,
          entity_id: entityId,
          ...(mediaContentId && mediaContentType
            ? { media_content_id: mediaContentId, media_content_type: mediaContentType }
            : {}),
        };
        const result = await connection.sendMessagePromise<{
          children?: {
            title: string;
            thumbnail: string | null;
            media_content_id: string;
            media_content_type: string;
            can_play: boolean;
            can_expand: boolean;
            children_media_class?: string;
          }[];
        }>(msg);

        const items: MediaItem[] = (result.children ?? []).map((c) => ({
          title: c.title,
          thumbnail: c.thumbnail
            ? c.thumbnail.startsWith('http')
              ? c.thumbnail
              : `${HA_HTTP}${c.thumbnail}`
            : null,
          media_content_id: c.media_content_id,
          media_content_type: c.media_content_type,
          can_play: c.can_play,
          can_expand: c.can_expand,
          children_media_class: c.children_media_class,
        }));
        setBrowseItems(items);

        if (mediaContentId && mediaContentType && title) {
          setBrowsePath((prev) => [...prev, { id: mediaContentId, type: mediaContentType, title }]);
        } else {
          setBrowsePath([]);
        }
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string };
        if (e?.code === 'not_supported') {
          setBrowseError('Start playing Spotify on a device first');
        } else {
          setBrowseError(e?.message ?? 'Browse failed');
        }
        console.warn('[Home OS] Spotify browse error:', err);
      } finally {
        setBrowseLoading(false);
      }
    },
    [connection]
  );

  const browseBack = useCallback(() => {
    if (browsePath.length <= 1) {
      // Go back to root
      browse();
    } else {
      const newPath = browsePath.slice(0, -2);
      const parent = browsePath[browsePath.length - 2];
      setBrowsePath(newPath);
      browse(parent.id, parent.type, parent.title);
    }
  }, [browsePath, browse]);

  const playMedia = useCallback(
    (contentId: string, contentType: string) => {
      call('play_media', {
        media_content_id: contentId,
        media_content_type: contentType,
      });
    },
    [call]
  );

  return {
    ...state,
    playPause,
    next,
    prev,
    setVolume,
    setShuffle,
    setRepeat,
    selectSource,
    browse,
    browseBack,
    browseItems,
    browsePath,
    browseLoading,
    browseError,
    playMedia,
  };
}
