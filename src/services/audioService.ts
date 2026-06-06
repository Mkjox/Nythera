import { AudioStatus, AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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
let statusCallback: StatusCallback | null = null;
let statusSubscription: { remove: () => void } | null = null;
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
  if (!player) {
    player = createAudioPlayer(uri);
    statusSubscription = player.addListener('playbackStatusUpdate', handleStatus);
  } else {
    player.replace(uri);
  }
  player.play();
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
