import { AudioStatus, AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

export type PlaybackState = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  isLoaded: boolean;
};

type StatusCallback = (state: PlaybackState) => void;
type RemoteCommand = (command: any) => void;

let player: AudioPlayer | null = null;
let nextPlayer: AudioPlayer | null = null;
let statusCallback: StatusCallback | null = null;
let statusSubscription: { remove: () => void } | null = null;
let nextStatusSubscription: { remove: () => void } | null = null;
let _lastStatus: any = null;
let _currentUri: string | null = null;
let _lastStatusUri: string | null = null;

export async function configureAudioSession() {
  await setAudioModeAsync({
    shouldPlayInBackground: true,
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
}

export function onPlaybackStatus(cb: StatusCallback) {
  statusCallback = cb;
}

function handleStatus(status: AudioStatus) {
  // Keep last status to detect end-of-track when player unloads in background
  const last = _lastStatus;
  _lastStatus = status;
  _lastStatusUri = _currentUri;
  if (!status.isLoaded) {
    // If the player just unloaded but the last known status indicated the track
    // reached its end, synthesize a final 'finished' status so consumers can
    // reliably detect track completion even when the native player unloads
    // immediately in background.
    if (
      last &&
      last.isLoaded &&
      typeof last.currentTime === 'number' &&
      typeof last.duration === 'number' &&
      last.duration > 0 &&
      last.currentTime >= last.duration - 0.5 &&
      _lastStatusUri && _currentUri && _lastStatusUri === _currentUri
    ) {
      // Synthesize final finished status when the native player unloads
      // (useful when the OS unloads the player in background).
      console.log('[audioService] synthesize finished status', { currentTime: last.currentTime, duration: last.duration });
      if (statusCallback) {
        statusCallback({ isPlaying: false, positionMs: Math.round((last.duration || 0) * 1000), durationMs: Math.round((last.duration || 0) * 1000), isLoaded: true });
      }
    } else {
      if (statusCallback) {
        statusCallback({ isPlaying: false, positionMs: 0, durationMs: 0, isLoaded: false });
      }
    }
    return;
  }
  if (statusCallback) {
    statusCallback({
      isPlaying: status.playing,
      positionMs: (status.currentTime || 0) * 1000,
      durationMs: (status.duration || 0) * 1000,
      isLoaded: true,
    });
  }
}

export async function loadAndPlay(uri: string): Promise<void> {
  _currentUri = uri;
  // Check persisted crossfade / gapless / normalize preferences
  let useCrossfade = false;
  let useGapless = false;
  let useNormalize = false;
  try {
    const [crossV, gapV, normV] = await Promise.all([
      AsyncStorage.getItem('@nythera_crossfade'),
      AsyncStorage.getItem('@nythera_gapless'),
      AsyncStorage.getItem('@nythera_normalize'),
    ]);
    useCrossfade = crossV === '1';
    useGapless = gapV === '1';
    useNormalize = normV === '1';
  } catch (e) {
    // ignore
  }

  const normalizationTarget = useNormalize ? 0.9 : 1.0;

  // If no existing player, behave as before
  if (!player || (!useCrossfade && !useGapless)) {
    if (!player) {
      player = createAudioPlayer(uri);
      statusSubscription = player.addListener('playbackStatusUpdate', handleStatus);
    } else {
      // try to replace if API available
      try { player.replace(uri); } catch (e) { /* ignore */ }
    }
    try {
      // Apply normalization target if supported
      try {
        const anyP: any = player as any;
        if (typeof anyP.setVolumeAsync === 'function') await anyP.setVolumeAsync(normalizationTarget);
        else if (typeof anyP.setVolume === 'function') anyP.setVolume(normalizationTarget);
        else if ('volume' in anyP) anyP.volume = normalizationTarget;
      } catch (e) { /* ignore */ }
      player.play();
    } catch (e) { /* ignore */ }
    return;
  }

  // Crossfade/gapless: create next player and handle transition
  try {
    nextPlayer = createAudioPlayer(uri);
    // subscribe status for next player so we continue receiving updates
    nextStatusSubscription = nextPlayer.addListener('playbackStatusUpdate', handleStatus);

    // helper to set volume with feature detection
    const setVol = async (p: AudioPlayer | null, vol: number) => {
      if (!p) return;
      const anyP: any = p as any;
      try {
        if (typeof anyP.setVolumeAsync === 'function') await anyP.setVolumeAsync(vol);
        else if (typeof anyP.setVolume === 'function') anyP.setVolume(vol);
        else if ('volume' in anyP) anyP.volume = vol;
      } catch (e) {
        // ignore
      }
    };

      if (useCrossfade) {
      // start next player at volume 0
      await setVol(nextPlayer, 0);
      try { nextPlayer.play(); } catch (e) { /* ignore */ }

      const durationMs = 3000;
      const stepMs = 100;
      const steps = Math.max(1, Math.floor(durationMs / stepMs));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const volNext = t;
        const volCurr = 1 - t;
        await setVol(nextPlayer, volNext * normalizationTarget);
        await setVol(player, volCurr * normalizationTarget);
        // small delay
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, stepMs));
      }

      // finalize: stop and remove old player
      try {
        player.pause();
        player.remove();
      } catch (e) { /* ignore */ }
      if (statusSubscription) {
        try { statusSubscription.remove(); } catch (e) { }
        statusSubscription = null;
      }

      // promote nextPlayer to player
      player = nextPlayer;
      statusSubscription = nextStatusSubscription;
      nextPlayer = null;
      nextStatusSubscription = null;
    } else if (useGapless) {
      // Gapless: attempt to start next player immediately and swap
      try {
        try {
          // Apply normalization target to next player if supported
          await setVol(nextPlayer, normalizationTarget);
          nextPlayer.play();
        } catch (e) { /* ignore */ }
        // Give the next player a short moment to start
        await new Promise((r) => setTimeout(r, 200));
      } catch (e) {
        // ignore
      }

      try {
        player.pause();
        player.remove();
      } catch (e) { /* ignore */ }
      if (statusSubscription) {
        try { statusSubscription.remove(); } catch (e) { }
        statusSubscription = null;
      }

      player = nextPlayer;
      statusSubscription = nextStatusSubscription;
      nextPlayer = null;
      nextStatusSubscription = null;
    } else {
      // shouldn't reach here — fallback
      try { player.replace(uri); player.play(); } catch (err) { /* ignore */ }
    }
  } catch (e) {
    console.warn('Crossfade failed, falling back to normal play', e);
    // fallback to simple replace
    try { player.replace(uri); player.play(); } catch (err) { /* ignore */ }
  }
}

// Remote command bridge from native notification actions -> JS
let remoteCommandCallback: RemoteCommand | null = null;
let nativeEvtSub: { remove: () => void } | null = null;

export function onRemoteCommand(cb: RemoteCommand) {
  remoteCommandCallback = cb;
  if (Platform.OS === 'android' && NativeModules.MediaNotificationModule) {
    const emitter = new NativeEventEmitter(NativeModules.MediaNotificationModule);
    nativeEvtSub = emitter.addListener('mediaControl', (payload: any) => {
      if (remoteCommandCallback) remoteCommandCallback(payload);
    });
  }
}

export async function pause(): Promise<void> {
  if (player) player.pause();
}

export async function resume(): Promise<void> {
  if (player) player.play();
}

export async function toggle(): Promise<void> {
  if (!player) return;
  try {
    // Use runtime check to avoid type issues with the upstream AudioPlayer type
    const p: any = player as any;
    if (p.playing) await p.pause();
    else await p.play();
  } catch (e) {
    console.warn('Audio toggle failed', e);
  }
}

export async function stop(): Promise<void> {
  if (player) {
    player.pause();
    player.remove();
    if (statusSubscription) {
      statusSubscription.remove();
      statusSubscription = null;
    }
    player = null;
  }
}

export async function seekTo(positionMs: number): Promise<void> {
  if (player) await player.seekTo(positionMs / 1000);
}

export async function setPlaybackSpeed(rate: number): Promise<void> {
  if (!player) return;
  const p: any = player as any;
  try {
    // Prefer an async API if available
    if (typeof p.setRateAsync === 'function') {
      // setRateAsync(rate, shouldCorrectPitch)
      await p.setRateAsync(rate, true);
      return;
    }
    if (typeof p.setRate === 'function') {
      p.setRate(rate);
      return;
    }
    // Fallback to direct property if it exists
    if ('playbackRate' in p) {
      p.playbackRate = rate;
      return;
    }
  } catch (e) {
    console.warn('Failed to set playback speed', e);
  }
}

export function isLoaded(): boolean {
  return player?.isLoaded ?? false;
}
