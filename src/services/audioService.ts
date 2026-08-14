import TrackPlayer, { Capability, State, Event, usePlaybackState, useProgress } from 'react-native-track-player';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type PlaybackState = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  isLoaded: boolean;
};

let isSetup = false;

export async function configureAudioSession() {
  if (isSetup) return;
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    });
    isSetup = true;
  } catch (e) {
    console.warn('TrackPlayer setup error', e);
  }
}

export function onPlaybackStatus(cb: (state: PlaybackState) => void) {
  // Not used directly in the same way anymore, as we'll use React hooks from track-player
  // but we can provide a dummy to prevent errors if MusicProvider expects it
  // until we update MusicProvider.
}

export async function loadAndPlay(uri: string): Promise<void> {
  if (!isSetup) await configureAudioSession();
  
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: uri,
    url: uri,
    title: 'Track',
    artist: 'Artist',
  });
  await TrackPlayer.play();
}

export function onRemoteCommand(cb: (command: any) => void) {
  // Native modules removed, track player handles this natively
}

// Equalizer bridge (Android native implemented). iOS requires native implementation when available.
const { NytheraEqualizer } = NativeModules as { NytheraEqualizer?: any };

export async function setEqualizerEnabled(enabled: boolean): Promise<void> {
  if (!NytheraEqualizer) return;
  try { await NytheraEqualizer.enable(enabled); } catch (e) { console.warn('EQ enable error', e); }
}

export async function setEqualizerBand(bandIndex: number, gainDb: number): Promise<void> {
  if (!NytheraEqualizer) return;
  try { await NytheraEqualizer.setBandLevel(bandIndex, gainDb); } catch (e) { console.warn('EQ setBand error', e); }
}

export async function setEqualizerPreset(gains: number[]): Promise<void> {
  if (!NytheraEqualizer) return;
  try { await NytheraEqualizer.setPreset(gains); } catch (e) { console.warn('EQ setPreset error', e); }
}

export async function setBassBoost(strengthPercent: number): Promise<void> {
  if (!NytheraEqualizer) return;
  try { await NytheraEqualizer.setBassBoost(strengthPercent); } catch (e) { console.warn('BassBoost error', e); }
}

export async function releaseEqualizer(): Promise<void> {
  if (!NytheraEqualizer) return;
  try { await NytheraEqualizer.release(); } catch (e) { console.warn('EQ release error', e); }
}

export async function pause(): Promise<void> {
  await TrackPlayer.pause();
}

export async function resume(): Promise<void> {
  await TrackPlayer.play();
}

export async function toggle(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function stop(): Promise<void> {
  await TrackPlayer.stop();
}

export async function seekTo(positionMs: number): Promise<void> {
  await TrackPlayer.seekTo(positionMs / 1000);
}

export async function setPlaybackSpeed(rate: number): Promise<void> {
  await TrackPlayer.setRate(rate);
}

export function isLoaded(): boolean {
  return isSetup;
}
