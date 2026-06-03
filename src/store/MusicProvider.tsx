import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Playlist, HistoryEntry } from '../types/music';
import * as audioService from '../services/audioService';
import { PlaybackState } from '../services/audioService';

// ─── State Shape ────────────────────────────────────────────────
export type MusicState = {
  // Library
  tracks: Record<string, Track>;
  playlists: Playlist[];
  favorites: Set<string>;
  history: HistoryEntry[];

  // Player
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';

  // App state
  isScanning: boolean;
  hasPermission: boolean;
  isInitialised: boolean;
  outputDevice?: string;
};

const initialState: MusicState = {
  tracks: {},
  playlists: [],
  favorites: new Set(),
  history: [],
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  shuffle: false,
  repeat: 'off',
  isScanning: false,
  hasPermission: false,
  isInitialised: false,
  outputDevice: 'phone',
};

// ─── Actions ────────────────────────────────────────────────────
type Action =
  | { type: 'SET_LIBRARY'; tracks: Record<string, Track>; playlists: Playlist[] }
  | { type: 'SET_SCANNING'; value: boolean }
  | { type: 'SET_PERMISSION'; value: boolean }
  | { type: 'SET_INITIALISED' }
  | { type: 'ADD_PLAYLIST'; playlist: Playlist; tracks: Track[] }
  | { type: 'REMOVE_FOLDER'; playlistId: string }
  | { type: 'REFRESH_FOLDER'; playlistId: string; tracks: Track[]; trackIds: string[] }
  | { type: 'TOGGLE_FAVORITE'; trackId: string }
  | { type: 'SET_FAVORITES'; ids: string[] }
  | { type: 'PLAY_TRACK'; track: Track; queue: Track[]; index: number }
  | { type: 'SET_QUEUE'; queue: Track[] }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' }
  | { type: 'SET_PLAYING'; value: boolean }
  | { type: 'SET_POSITION'; positionMs: number; durationMs: number }
  | { type: 'SET_SHUFFLE'; value: boolean }
  | { type: 'SET_REPEAT'; value: 'off' | 'all' | 'one' }
  | { type: 'ADD_HISTORY'; entry: HistoryEntry }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'RESTORE_HISTORY'; history: HistoryEntry[] }
  | { type: 'RESTORE_PLAYLISTS'; playlists: Playlist[] }
  | { type: 'SET_OUTPUT_DEVICE'; id: string };

// ─── Reducer ────────────────────────────────────────────────────
function reducer(state: MusicState, action: Action): MusicState {
  switch (action.type) {
    case 'SET_LIBRARY': {
      // Preserve favorites on existing tracks
      const merged: Record<string, Track> = {};
      for (const [id, track] of Object.entries(action.tracks)) {
        merged[id] = { ...track, isFavorite: state.favorites.has(id) };
      }
      return { ...state, tracks: merged, playlists: action.playlists };
    }
    case 'SET_SCANNING':
      return { ...state, isScanning: action.value };
    case 'SET_PERMISSION':
      return { ...state, hasPermission: action.value };
    case 'SET_INITIALISED':
      return { ...state, isInitialised: true };
    case 'ADD_PLAYLIST': {
      const newTracks = { ...state.tracks };
      for (const t of action.tracks) {
        newTracks[t.id] = { ...t, isFavorite: state.favorites.has(t.id) };
      }
      return {
        ...state,
        tracks: newTracks,
        playlists: [...state.playlists, action.playlist],
      };
    }
    case 'REMOVE_FOLDER': {
      const pl = state.playlists.find(p => p.id === action.playlistId);
      if (!pl) return state;
      const newTracks = { ...state.tracks };
      for (const tid of pl.trackIds) {
        delete newTracks[tid];
      }
      const newFavs = new Set(state.favorites);
      for (const tid of pl.trackIds) {
        newFavs.delete(tid);
      }
      return {
        ...state,
        tracks: newTracks,
        playlists: state.playlists.filter(p => p.id !== action.playlistId),
        favorites: newFavs,
      };
    }
    case 'REFRESH_FOLDER': {
      const newTracks = { ...state.tracks };
      for (const t of action.tracks) {
        newTracks[t.id] = { ...t, isFavorite: state.favorites.has(t.id) };
      }
      return {
        ...state,
        tracks: newTracks,
        playlists: state.playlists.map(p =>
          p.id === action.playlistId
            ? { ...p, trackIds: action.trackIds, trackCount: action.trackIds.length }
            : p
        ),
      };
    }
    case 'TOGGLE_FAVORITE': {
      const newFavs = new Set(state.favorites);
      if (newFavs.has(action.trackId)) {
        newFavs.delete(action.trackId);
      } else {
        newFavs.add(action.trackId);
      }
      const updatedTrack = state.tracks[action.trackId];
      return {
        ...state,
        favorites: newFavs,
        tracks: updatedTrack
          ? { ...state.tracks, [action.trackId]: { ...updatedTrack, isFavorite: !updatedTrack.isFavorite } }
          : state.tracks,
        currentTrack: state.currentTrack?.id === action.trackId
          ? { ...state.currentTrack, isFavorite: !state.currentTrack.isFavorite }
          : state.currentTrack,
      };
    }
    case 'SET_FAVORITES': {
      const favSet = new Set(action.ids);
      const newTracks: Record<string, Track> = {};
      for (const [id, track] of Object.entries(state.tracks)) {
        newTracks[id] = { ...track, isFavorite: favSet.has(id) };
      }
      return { ...state, favorites: favSet, tracks: newTracks };
    }
    case 'PLAY_TRACK':
      return {
        ...state,
        currentTrack: action.track,
        queue: action.queue,
        queueIndex: action.index,
        isPlaying: true,
        positionMs: 0,
      };
    case 'SET_QUEUE':
      return { ...state, queue: action.queue };
    case 'NEXT_TRACK': {
      if (state.queue.length === 0) return state;
      if (state.repeat === 'one') {
        return { ...state, positionMs: 0 };
      }
      let nextIdx = state.queueIndex + 1;
      if (nextIdx >= state.queue.length) {
        if (state.repeat === 'all') nextIdx = 0;
        else return { ...state, isPlaying: false };
      }
      return {
        ...state,
        queueIndex: nextIdx,
        currentTrack: state.queue[nextIdx],
        positionMs: 0,
        isPlaying: true,
      };
    }
    case 'PREV_TRACK': {
      if (state.queue.length === 0) return state;
      // If more than 3 seconds in, restart current track
      if (state.positionMs > 3000) {
        return { ...state, positionMs: 0 };
      }
      let prevIdx = state.queueIndex - 1;
      if (prevIdx < 0) prevIdx = state.repeat === 'all' ? state.queue.length - 1 : 0;
      return {
        ...state,
        queueIndex: prevIdx,
        currentTrack: state.queue[prevIdx],
        positionMs: 0,
        isPlaying: true,
      };
    }
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'SET_POSITION':
      return { ...state, positionMs: action.positionMs, durationMs: action.durationMs };
    case 'SET_SHUFFLE':
      if (action.value && state.queue.length > 0) {
        // Enable shuffle: keep currentTrack at front, shuffle the rest
        const currentId = state.currentTrack?.id ?? null;
        const rest = state.queue.filter(t => t.id !== currentId);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        const newQueue = currentId ? [state.currentTrack!, ...rest] : rest;
        return { ...state, shuffle: true, queue: newQueue, queueIndex: currentId ? 0 : -1 };
      }
      // Disabling shuffle: keep current queue order as-is
      return { ...state, shuffle: false };
    case 'SET_REPEAT':
      return { ...state, repeat: action.value };
    case 'ADD_HISTORY':
      return { ...state, history: [action.entry, ...state.history].slice(0, 100) };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'RESTORE_HISTORY':
      return { ...state, history: action.history };
    case 'RESTORE_PLAYLISTS':
      return { ...state, playlists: action.playlists };
    case 'SET_OUTPUT_DEVICE':
      return { ...state, outputDevice: action.id };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────
type MusicContextType = {
  state: MusicState;
  dispatch: React.Dispatch<Action>;
  setOutputDevice: (id: string) => void;
  playTrack: (track: Track, queue?: Track[], index?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  removeFolder: (playlistId: string) => void;
  getAllTracks: () => Track[];
  getPlaylistTracks: (playlistId: string) => Track[];
  getRecentTracks: () => Track[];
  getFavoriteTracks: () => Track[];
};

const MusicContext = createContext<MusicContextType | null>(null);

// ─── Persistence Keys ───────────────────────────────────────────
const STORAGE_KEYS = {
  PLAYLISTS: '@nythera_playlists',
  TRACKS: '@nythera_tracks',
  FAVORITES: '@nythera_favorites',
  HISTORY: '@nythera_history',
};

// ─── Provider ───────────────────────────────────────────────────
export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Persist playlists whenever they change
  useEffect(() => {
    if (state.isInitialised) {
      AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(state.playlists)).catch(() => {});
    }
  }, [state.playlists, state.isInitialised]);

  // Persist tracks whenever they change
  useEffect(() => {
    if (state.isInitialised) {
      AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(state.tracks)).catch(() => {});
    }
  }, [state.tracks, state.isInitialised]);

  // Persist favorites whenever they change
  useEffect(() => {
    if (state.isInitialised) {
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...state.favorites])).catch(() => {});
    }
  }, [state.favorites, state.isInitialised]);

  // Persist history whenever it changes
  useEffect(() => {
    if (state.isInitialised) {
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history)).catch(() => {});
    }
  }, [state.history, state.isInitialised]);

  // Restore persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        await audioService.configureAudioSession();

        const [playlistsJson, tracksJson, favoritesJson, historyJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS),
          AsyncStorage.getItem(STORAGE_KEYS.TRACKS),
          AsyncStorage.getItem(STORAGE_KEYS.FAVORITES),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
        ]);

        if (tracksJson && playlistsJson) {
          const tracks = JSON.parse(tracksJson);
          const playlists = JSON.parse(playlistsJson);
          dispatch({ type: 'SET_LIBRARY', tracks, playlists });
        }

        if (favoritesJson) {
          const favs = JSON.parse(favoritesJson);
          dispatch({ type: 'SET_FAVORITES', ids: favs });
        }

        if (historyJson) {
          const history = JSON.parse(historyJson);
          dispatch({ type: 'RESTORE_HISTORY', history });
        }
      } catch (e) {
        console.warn('Failed to restore persisted data:', e);
      }
      dispatch({ type: 'SET_INITIALISED' });
    })();
  }, []);

  // Listen for track completion
  const playStateTimerRef = useRef<number | null>(null);
  const lastPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    audioService.onPlaybackStatus((ps: PlaybackState) => {
      const s = stateRef.current;
      if (ps.isLoaded) {
        // Update position immediately
        dispatch({ type: 'SET_POSITION', positionMs: ps.positionMs, durationMs: ps.durationMs });

        // Debounce transient isPlaying toggles (buffering spikes can flip this briefly)
        if (ps.isPlaying !== lastPlayingRef.current) {
          if (playStateTimerRef.current) {
            clearTimeout(playStateTimerRef.current);
            playStateTimerRef.current = null;
          }
          playStateTimerRef.current = (setTimeout(() => {
            dispatch({ type: 'SET_PLAYING', value: ps.isPlaying });
            lastPlayingRef.current = ps.isPlaying;
            playStateTimerRef.current = null;
          }, 250) as unknown) as number;
        }

        // Track finished detection
        if (!ps.isPlaying && ps.positionMs > 0 && ps.durationMs > 0 && ps.positionMs >= ps.durationMs - 500) {
          if (s.currentTrack) {
            dispatch({ type: 'ADD_HISTORY', entry: { trackId: s.currentTrack.id, playedAt: Date.now() } });
          }
          setTimeout(() => dispatch({ type: 'NEXT_TRACK' }), 100);
        }
      } else {
        dispatch({ type: 'SET_PLAYING', value: false });
        dispatch({ type: 'SET_POSITION', positionMs: 0, durationMs: 0 });
      }
    });

    return () => {
      if (playStateTimerRef.current) {
        clearTimeout(playStateTimerRef.current);
        playStateTimerRef.current = null;
      }
    };
  }, []);

  // When currentTrack changes via NEXT/PREV, load it
  const prevTrackIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.currentTrack && state.currentTrack.id !== prevTrackIdRef.current) {
      prevTrackIdRef.current = state.currentTrack.id;
      audioService.loadAndPlay(state.currentTrack.uri).catch(console.warn);
    }
  }, [state.currentTrack]);

  // ─── Actions ────────────────────────────────────────────────
  const playTrack = useCallback(async (track: Track, queue?: Track[], index?: number) => {
    const q = queue || [track];
    const idx = index ?? 0;
    // Only dispatch state change — the useEffect watching currentTrack handles audio loading
    dispatch({ type: 'PLAY_TRACK', track, queue: q, index: idx });
  }, []);

  const togglePlayPause = useCallback(async () => {
    // Use audioService.toggle which inspects the actual player state
    await audioService.toggle();
  }, []);

  const nextTrack = useCallback(async () => {
    dispatch({ type: 'NEXT_TRACK' });
  }, []);

  const prevTrack = useCallback(async () => {
    const s = stateRef.current;
    if (s.positionMs > 3000) {
      await audioService.seekTo(0);
      dispatch({ type: 'SET_POSITION', positionMs: 0, durationMs: s.durationMs });
    } else {
      dispatch({ type: 'PREV_TRACK' });
    }
  }, []);

  const seekTo = useCallback(async (ms: number) => {
    await audioService.seekTo(ms);
  }, []);

  const removeFolder = useCallback((playlistId: string) => {
    dispatch({ type: 'REMOVE_FOLDER', playlistId });
  }, []);

  const getAllTracks = useCallback(() => {
    return Object.values(stateRef.current.tracks);
  }, []);

  const getPlaylistTracks = useCallback((playlistId: string) => {
    const pl = stateRef.current.playlists.find(p => p.id === playlistId);
    if (!pl) return [];
    return pl.trackIds
      .map(id => stateRef.current.tracks[id])
      .filter(Boolean);
  }, []);

  const getRecentTracks = useCallback(() => {
    const seen = new Set<string>();
    const result: Track[] = [];
    for (const entry of stateRef.current.history) {
      if (!seen.has(entry.trackId)) {
        seen.add(entry.trackId);
        const track = stateRef.current.tracks[entry.trackId];
        if (track) result.push(track);
      }
      if (result.length >= 10) break;
    }
    return result;
  }, []);

  const getFavoriteTracks = useCallback(() => {
    return Object.values(stateRef.current.tracks).filter(t => t.isFavorite);
  }, []);

  const value: MusicContextType = {
    state,
    dispatch,
    setOutputDevice: (id: string) => dispatch({ type: 'SET_OUTPUT_DEVICE', id }),
    playTrack,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    removeFolder,
    getAllTracks,
    getPlaylistTracks,
    getRecentTracks,
    getFavoriteTracks,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────
export function useMusicStore() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicStore must be inside MusicProvider');
  return ctx;
}

export function usePlayer() {
  const { state, togglePlayPause, nextTrack, prevTrack, seekTo, playTrack } = useMusicStore();
  return {
    currentTrack: state.currentTrack,
    queue: state.queue,
    queueIndex: state.queueIndex,
    isPlaying: state.isPlaying,
    positionMs: state.positionMs,
    durationMs: state.durationMs,
    shuffle: state.shuffle,
    repeat: state.repeat,
    togglePlayPause,
    nextTrack,
    prevTrack,
    seekTo,
    playTrack,
  };
}

export function useLibrary() {
  const { state, dispatch, getAllTracks, getPlaylistTracks, getRecentTracks, getFavoriteTracks, removeFolder } = useMusicStore();
  return {
    tracks: state.tracks,
    playlists: state.playlists,
    favorites: state.favorites,
    history: state.history,
    isScanning: state.isScanning,
    hasPermission: state.hasPermission,
    isInitialised: state.isInitialised,
    dispatch,
    getAllTracks,
    getPlaylistTracks,
    getRecentTracks,
    getFavoriteTracks,
    removeFolder,
  };
}
