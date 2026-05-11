export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // "m:ss"
  durationSec: number;
  isFavorite: boolean;
  isDownloaded: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  colorA: string;
  colorB: string;
};

export type Artist = {
  id: string;
  name: string;
  genre: string;
};

export const TRACKS: Track[] = [
  { id: 't1', title: 'Neon Drift', artist: 'Synthex', album: 'Cyberpulse', duration: '3:42', durationSec: 222, isFavorite: true, isDownloaded: true },
  { id: 't2', title: 'Midnight Bloom', artist: 'Luna Vera', album: 'Starfield', duration: '4:15', durationSec: 255, isFavorite: false, isDownloaded: true },
  { id: 't3', title: 'Ghost Protocol', artist: 'Axon', album: 'Phantom', duration: '3:58', durationSec: 238, isFavorite: true, isDownloaded: false },
  { id: 't4', title: 'Solar Winds', artist: 'Helion', album: 'Orbital', duration: '5:02', durationSec: 302, isFavorite: false, isDownloaded: false },
  { id: 't5', title: 'Deep Blue', artist: 'Oceanic', album: 'Abyss', duration: '3:27', durationSec: 207, isFavorite: true, isDownloaded: true },
  { id: 't6', title: 'Voltage', artist: 'Synthex', album: 'Cyberpulse', duration: '2:55', durationSec: 175, isFavorite: false, isDownloaded: false },
  { id: 't7', title: 'Crystal Cave', artist: 'Prism', album: 'Refraction', duration: '4:44', durationSec: 284, isFavorite: false, isDownloaded: true },
  { id: 't8', title: 'Iron Sky', artist: 'Thunderhead', album: 'Anvil', duration: '3:11', durationSec: 191, isFavorite: true, isDownloaded: false },
  { id: 't9', title: 'Velvet Haze', artist: 'Luna Vera', album: 'Starfield', duration: '4:30', durationSec: 270, isFavorite: false, isDownloaded: false },
  { id: 't10', title: 'Pulse', artist: 'Axon', album: 'Phantom', duration: '3:05', durationSec: 185, isFavorite: true, isDownloaded: true },
  { id: 't11', title: 'Aurora', artist: 'Helion', album: 'Orbital', duration: '5:18', durationSec: 318, isFavorite: false, isDownloaded: false },
  { id: 't12', title: 'Undertow', artist: 'Oceanic', album: 'Abyss', duration: '3:52', durationSec: 232, isFavorite: true, isDownloaded: true },
  { id: 't13', title: 'Shattered Light', artist: 'Prism', album: 'Refraction', duration: '4:09', durationSec: 249, isFavorite: false, isDownloaded: false },
  { id: 't14', title: 'Storm Front', artist: 'Thunderhead', album: 'Anvil', duration: '3:35', durationSec: 215, isFavorite: false, isDownloaded: true },
  { id: 't15', title: 'Echoes', artist: 'Synthex', album: 'Echoes EP', duration: '4:00', durationSec: 240, isFavorite: true, isDownloaded: true },
];

export const PLAYLISTS: Playlist[] = [
  { id: 'p1', name: 'Chill Vibes', description: 'Low-key beats for focus and flow', trackCount: 24, colorA: '#7C3AED', colorB: '#3B82F6' },
  { id: 'p2', name: 'Late Night Drive', description: 'Synth waves for neon streets', trackCount: 18, colorA: '#EC4899', colorB: '#7C3AED' },
  { id: 'p3', name: 'Power Hour', description: 'High energy. No brakes.', trackCount: 32, colorA: '#F97316', colorB: '#EF4444' },
  { id: 'p4', name: 'Deep Space', description: 'Ambient journeys across the void', trackCount: 15, colorA: '#06B6D4', colorB: '#3B82F6' },
  { id: 'p5', name: 'Morning Ritual', description: 'Start the day right', trackCount: 20, colorA: '#F59E0B', colorB: '#F97316' },
  { id: 'p6', name: 'Phantom Frequencies', description: 'Dark electronic selections', trackCount: 28, colorA: '#5B21B6', colorB: '#EC4899' },
];

export const ARTISTS: Artist[] = [
  { id: 'a1', name: 'Synthex', genre: 'Synthwave' },
  { id: 'a2', name: 'Luna Vera', genre: 'Dream Pop' },
  { id: 'a3', name: 'Axon', genre: 'Electronic' },
  { id: 'a4', name: 'Helion', genre: 'Ambient' },
  { id: 'a5', name: 'Oceanic', genre: 'Chillwave' },
  { id: 'a6', name: 'Prism', genre: 'Indie Electronic' },
  { id: 'a7', name: 'Thunderhead', genre: 'Industrial' },
];

export const RECENT_TRACKS = TRACKS.slice(0, 5);
export const FEATURED_PLAYLIST = PLAYLISTS[1];
export const SUGGESTED_PLAYLISTS = PLAYLISTS.slice(0, 4);

export const QUEUE_TRACKS = TRACKS.slice(0, 8);

export const HISTORY: (Track & { playedAt: string })[] = [
  { ...TRACKS[0], playedAt: 'Just now' },
  { ...TRACKS[2], playedAt: '12 min ago' },
  { ...TRACKS[4], playedAt: '1 hr ago' },
  { ...TRACKS[1], playedAt: '2 hr ago' },
  { ...TRACKS[6], playedAt: 'Yesterday' },
  { ...TRACKS[9], playedAt: 'Yesterday' },
  { ...TRACKS[11], playedAt: '2 days ago' },
];

export const DOWNLOADS: (Track & { progress: number; status: 'done' | 'downloading' | 'paused' })[] = [
  { ...TRACKS[0], progress: 1, status: 'done' },
  { ...TRACKS[1], progress: 1, status: 'done' },
  { ...TRACKS[4], progress: 1, status: 'done' },
  { ...TRACKS[6], progress: 0.62, status: 'downloading' },
  { ...TRACKS[9], progress: 0.28, status: 'paused' },
  { ...TRACKS[11], progress: 1, status: 'done' },
  { ...TRACKS[13], progress: 1, status: 'done' },
];

export const NOW_PLAYING: Track = TRACKS[0];
