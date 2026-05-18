import * as MediaLibrary from 'expo-media-library';
import { Track, Playlist, PLAYLIST_COLORS } from '../types/music';

/**
 * Request media library permissions.
 * On Android 13+ this requests granular audio access.
 * Returns true if granted or limited.
 */
export async function requestMediaPermission(): Promise<boolean> {
  const { status, accessPrivileges } = await MediaLibrary.requestPermissionsAsync(
    false,                   // writeOnly = false (we need READ access)
    ['audio'],               // granularPermissions for Android 13+
  );
  // 'granted' on older Android, 'limited' can also work
  return status === 'granted' || accessPrivileges === 'all' || accessPrivileges === 'limited';
}

/**
 * Check if media library permission is already granted.
 */
export async function checkMediaPermission(): Promise<boolean> {
  const { status, accessPrivileges } = await MediaLibrary.getPermissionsAsync();
  return status === 'granted' || accessPrivileges === 'all' || accessPrivileges === 'limited';
}

/**
 * Derive a readable title from a filename by stripping the extension.
 */
function titleFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
}

/**
 * Format seconds into "m:ss".
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a simple hash-like ID from a string.
 */
function generateId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return 't_' + Math.abs(hash).toString(36);
}

/**
 * Scan all audio files on the device and group them by album (folder).
 */
export async function scanAudioFiles(): Promise<{ tracks: Track[]; playlists: Playlist[] }> {
  const allTracks: Track[] = [];
  const folderMap = new Map<string, { tracks: Track[]; folderUri: string }>();

  // Fetch all albums first to build ID → name lookup
  const albumNameMap = new Map<string, string>();
  try {
    const albums = await MediaLibrary.getAlbumsAsync();
    for (const album of albums) {
      albumNameMap.set(album.id, album.title);
    }
  } catch (_) {}

  let hasMore = true;
  let endCursor: string | undefined;

  while (hasMore) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 500,
      after: endCursor,
      sortBy: [[MediaLibrary.SortBy.default, true]],
    });

    for (const asset of page.assets) {
      const durationSec = Math.round(asset.duration);
      const track: Track = {
        id: generateId(asset.uri + asset.filename),
        title: titleFromFilename(asset.filename),
        duration: formatDuration(durationSec),
        durationSec,
        uri: asset.uri,
        isFavorite: false,
      };
      allTracks.push(track);

      // Group by albumId, resolve name from lookup
      const albumId = asset.albumId || '_unknown_';
      if (!folderMap.has(albumId)) {
        folderMap.set(albumId, { tracks: [], folderUri: albumId });
      }
      folderMap.get(albumId)!.tracks.push(track);
    }

    hasMore = page.hasNextPage;
    endCursor = page.endCursor;
  }

  // Build playlists from folder groups
  const playlists: Playlist[] = [];
  let colorIdx = 0;

  for (const [albumId, data] of folderMap) {
    const albumName = albumNameMap.get(albumId) || albumId;

    const colors = PLAYLIST_COLORS[colorIdx % PLAYLIST_COLORS.length];
    colorIdx++;

    playlists.push({
      id: 'pl_' + generateId(albumId),
      name: albumName,
      trackCount: data.tracks.length,
      colorA: colors[0],
      colorB: colors[1],
      folderUri: albumId,
      trackIds: data.tracks.map(t => t.id),
    });
  }

  return { tracks: allTracks, playlists };
}

/**
 * Re-scan a single folder/album by its albumId.
 */
export async function rescanFolder(albumId: string): Promise<Track[]> {
  const tracks: Track[] = [];
  let hasMore = true;
  let endCursor: string | undefined;

  while (hasMore) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      album: albumId,
      first: 500,
      after: endCursor,
    });

    for (const asset of page.assets) {
      const durationSec = Math.round(asset.duration);
      tracks.push({
        id: generateId(asset.uri + asset.filename),
        title: titleFromFilename(asset.filename),
        duration: formatDuration(durationSec),
        durationSec,
        uri: asset.uri,
        isFavorite: false,
      });
    }

    hasMore = page.hasNextPage;
    endCursor = page.endCursor;
  }

  return tracks;
}
