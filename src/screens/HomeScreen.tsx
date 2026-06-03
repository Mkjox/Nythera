import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary, usePlayer } from '../store/MusicProvider';
import { scanAudioFiles, requestMediaPermission } from '../services/scanService';
import PlaylistCard from '../components/PlaylistCard';
import AlbumPickerModal from '../components/AlbumPickerModal';
import TrackItem from '../components/TrackItem';
import SectionHeader from '../components/SectionHeader';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { playlists, isScanning, hasPermission, dispatch, getAllTracks, getRecentTracks, getFavoriteTracks, removeFolder } = useLibrary();
  const [pickerVisible, setPickerVisible] = React.useState(false);
  const { playTrack } = usePlayer();

  const allTracks = getAllTracks();
  const recentTracks = getRecentTracks();
  const favoriteTracks = getFavoriteTracks();
  const hasMusic = allTracks.length > 0;

  const handleImport = useCallback(async () => {
    let perm = hasPermission;
    if (!perm) {
      perm = await requestMediaPermission();
      dispatch({ type: 'SET_PERMISSION', value: perm });
    }
    if (!perm) return;

    dispatch({ type: 'SET_SCANNING', value: true });
    try {
      const { tracks, playlists: scannedPlaylists } = await scanAudioFiles();
      const trackMap: Record<string, any> = {};
      for (const t of tracks) trackMap[t.id] = t;
      dispatch({ type: 'SET_LIBRARY', tracks: trackMap, playlists: scannedPlaylists });
    } catch (e) {
      console.warn('Scan error:', e);
    }
    dispatch({ type: 'SET_SCANNING', value: false });
  }, [hasPermission, dispatch]);

  const handleShuffleAll = useCallback(() => {
    if (allTracks.length === 0) return;
    const shuffled = [...allTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled, 0);
  }, [allTracks, playTrack]);

  const handlePlayTrack = useCallback((track: any, index: number, trackList: any[]) => {
    playTrack(track, trackList, index);
  }, [playTrack]);

  const handleDeleteFolder = useCallback((playlistId: string, name: string) => {
    Alert.alert(
      'Remove Folder',
      `Are you sure you want to remove "${name}" and all its tracks from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFolder(playlistId) },
      ]
    );
  }, [removeFolder]);

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.headerTitle}>What do you feel like?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
          <TouchableOpacity style={styles.chip} onPress={handleShuffleAll}>
            <Ionicons name="shuffle" size={14} color={colors.accentLight} />
            <Text style={styles.chipText}>Shuffle All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('Library')}>
            <Ionicons name="heart" size={14} color={colors.accentLight} />
            <Text style={styles.chipText}>Liked</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('History')}>
            <Ionicons name="time-outline" size={14} color={colors.accentLight} />
            <Text style={styles.chipText}>Recent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={handleImport}>
            <Ionicons name="scan-outline" size={14} color={colors.accentLight} />
            <Text style={styles.chipText}>{isScanning ? 'Scanning…' : 'Scan Device'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => setPickerVisible(true)}>
            <Ionicons name="folder-open" size={14} color={colors.accentLight} />
            <Text style={styles.chipText}>Import Folders</Text>
          </TouchableOpacity>
        </ScrollView>

        {!hasMusic ? (
          /* Empty state */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="folder-open-outline" size={64} color={colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>No local music found</Text>
            <Text style={styles.emptySub}>
              Tap below to scan your device for audio files and import them as playlists.
            </Text>
            <TouchableOpacity style={styles.importBtn} onPress={handleImport} disabled={isScanning}>
              <Ionicons name="scan" size={18} color={colors.white} />
              <Text style={styles.importBtnText}>{isScanning ? 'Scanning Device…' : 'Scan & Import Music'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Featured banner — first playlist */}
            {playlists.length > 0 && (
              <TouchableOpacity
                style={[styles.featured, { backgroundColor: playlists[0].colorA }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Playlist', { playlistId: playlists[0].id })}
              >
                <View style={[styles.featuredOverlay, { backgroundColor: playlists[0].colorB + '66' }]} />
                <View style={styles.featuredLeft}>
                  <Text style={styles.featuredEyebrow}>YOUR COLLECTION</Text>
                  <Text style={styles.featuredTitle}>{playlists[0].name}</Text>
                  <Text style={styles.featuredDesc}>{playlists[0].trackCount} tracks</Text>
                  <View style={styles.featuredPlay}>
                    <Ionicons name="play" size={13} color={colors.white} />
                    <Text style={styles.featuredPlayTxt}>Play Now</Text>
                  </View>
                </View>
                <Ionicons name="folder-open" size={64} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            )}

            {/* Your Playlists */}
            {playlists.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Your Folders" actionLabel="Library" onAction={() => navigation.navigate('Library')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                  {playlists.slice(0, 6).map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onPress={() => navigation.navigate('Playlist', { playlistId: pl.id })}
                      onDelete={() => handleDeleteFolder(pl.id, pl.name)}
                      size={148}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recently Played */}
            {recentTracks.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Recently Played" actionLabel="History" onAction={() => navigation.navigate('History')} />
                {recentTracks.slice(0, 5).map((t, i) => (
                  <TrackItem key={t.id} track={t} onPress={() => handlePlayTrack(t, i, recentTracks)} />
                ))}
              </View>
            )}

            {/* Favorites */}
            {favoriteTracks.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Liked Songs" />
                {favoriteTracks.slice(0, 5).map((t, i) => (
                  <TrackItem key={t.id} track={t} onPress={() => handlePlayTrack(t, i, favoriteTracks)} />
                ))}
              </View>
            )}

            {/* More playlists */}
            {playlists.length > 1 && (
              <View style={styles.section}>
                <SectionHeader title="More Folders" actionLabel="Library" onAction={() => navigation.navigate('Library')} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
                  {playlists.slice(1).map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onPress={() => navigation.navigate('Playlist', { playlistId: pl.id })}
                      onDelete={() => handleDeleteFolder(pl.id, pl.name)}
                      size={130}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
      <AlbumPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.base },
  greeting: { fontSize: typography.sm, color: colors.textSecondary },
  headerTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chipsScroll: { marginBottom: spacing.base },
  chips: { paddingHorizontal: spacing.base, gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 7 },
  chipText: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  emptyState: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.md },
  emptyIconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  emptySub: { fontSize: typography.base, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  importBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.md, shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  importBtnText: { fontSize: typography.base, fontWeight: typography.bold, color: colors.white },
  featured: { marginHorizontal: spacing.base, borderRadius: radius.xl, padding: spacing.xl, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl, minHeight: 148 },
  featuredOverlay: { ...StyleSheet.absoluteFillObject },
  featuredLeft: { flex: 1 },
  featuredEyebrow: { fontSize: typography.xs, fontWeight: typography.bold, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, marginBottom: 4 },
  featuredTitle: { fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.white, marginBottom: 4 },
  featuredDesc: { fontSize: typography.sm, color: 'rgba(255,255,255,0.65)', marginBottom: spacing.md },
  featuredPlay: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start' },
  featuredPlayTxt: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.white },
  section: { paddingHorizontal: spacing.base, marginBottom: spacing.xl },
  hList: { gap: spacing.md, paddingRight: spacing.base },
});
