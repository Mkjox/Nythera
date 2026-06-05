export type Track = {
  id: string;
  title: string;         // filename without extension
  duration: string;      // "m:ss" formatted
  durationSec: number;
  uri: string;           // file:// or content:// URI
  isFavorite: boolean;
  // Optional metadata used for notifications / UI
  artist?: string;
  artwork?: string;      // artwork URI or path
  albumArt?: string;     // legacy alias
};

export type Playlist = {
  id: string;
  name: string;          // folder name
  trackCount: number;
  colorA: string;
  colorB: string;
  folderUri: string;     // source folder path
  trackIds: string[];    // ordered list of track IDs
};

export type HistoryEntry = {
  trackId: string;
  playedAt: number;      // timestamp ms
};

// Palette used to auto-assign colors to new playlists
export const PLAYLIST_COLORS: [string, string][] = [
  ['#7C3AED', '#3B82F6'],
  ['#EC4899', '#7C3AED'],
  ['#F97316', '#EF4444'],
  ['#06B6D4', '#3B82F6'],
  ['#F59E0B', '#F97316'],
  ['#5B21B6', '#EC4899'],
  ['#22C55E', '#06B6D4'],
  ['#3B82F6', '#22C55E'],
];
