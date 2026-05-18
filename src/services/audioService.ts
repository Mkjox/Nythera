import { AudioStatus, AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type PlaybackState = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  isLoaded: boolean;
};

type StatusCallback = (state: PlaybackState) => void;

let player: AudioPlayer | null = null;
let statusCallback: StatusCallback | null = null;
let statusSubscription: { remove: () => void } | null = null;

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
  if (!status.isLoaded) {
    if (statusCallback) {
      statusCallback({ isPlaying: false, positionMs: 0, durationMs: 0, isLoaded: false });
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
  if (!player) {
    player = createAudioPlayer(uri);
    statusSubscription = player.addListener('playbackStatusUpdate', handleStatus);
  } else {
    player.replace(uri);
  }
  player.play();
}

export async function pause(): Promise<void> {
  if (player) player.pause();
}

export async function resume(): Promise<void> {
  if (player) player.play();
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
  if (player) player.playbackRate = rate;
}

export function isLoaded(): boolean {
  return player?.isLoaded ?? false;
}
