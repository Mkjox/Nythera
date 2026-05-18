import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary, usePlayer } from '../store/MusicProvider';
import TrackItem from '../components/TrackItem';

export default function PlaylistScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { playlists, getPlaylistTracks, dispatch } = useLibrary();
  const { playTrack } = usePlayer();

  const playlistId = route.params?.playlistId;
  const playlist = playlists.find(p => p.id === playlistId);
  const tracks = playlist ? getPlaylistTracks(playlistId) : [];

  const totalDuration = tracks.reduce((sum, t) => sum + t.durationSec, 0);
  const totalMins = Math.floor(totalDuration / 60);
  const totalHrs = Math.floor(totalMins / 60);
  const remainMins = totalMins % 60;
  const durationLabel = totalHrs > 0 ? `${totalHrs} hr ${remainMins} min` : `${totalMins} min`;

  const handlePlay = useCallback(() => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks, 0);
    }
  }, [tracks, playTrack]);

  const handleShuffle = useCallback(() => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled, 0);
    }
  }, [tracks, playTrack]);

  const handlePlayTrack = useCallback((index: number) => {
    playTrack(tracks[index], tracks, index);
  }, [tracks, playTrack]);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.md }}>Playlist not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: playlist.colorA }]}>
          <View style={[styles.heroOverlay, { backgroundColor: playlist.colorB + '66' }]} />
          <View style={styles.heroArt}>
            <Ionicons name="folder-open" size={72} color="rgba(255,255,255,0.35)" />
          </View>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={styles.plName}>{playlist.name}</Text>
          <Text style={styles.plStats}>{playlist.trackCount} songs • {durationLabel}</Text>

          {/* Action row */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={handlePlay}>
              <Ionicons name="play" size={18} color={colors.white} />
              <Text style={styles.actionBtnTxt}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={handleShuffle}>
              <Ionicons name="shuffle" size={16} color={colors.accentLight} />
              <Text style={styles.actionOutlineTxt}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={() => {
              // Toggle favorite for all tracks in playlist
              for (const t of tracks) {
                if (!t.isFavorite) dispatch({ type: 'TOGGLE_FAVORITE', trackId: t.id });
              }
            }}>
              <Ionicons name="heart-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tracks */}
        <View style={styles.tracksSection}>
          <View style={styles.tracksHeader}>
            <Text style={styles.tracksSectionTitle}>Tracks</Text>
          </View>
          {tracks.length === 0 ? (
            <View style={styles.emptyTracks}>
              <Ionicons name="musical-notes-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyTracksTxt}>No tracks in this folder</Text>
            </View>
          ) : (
            tracks.map((t, i) => (
              <View key={t.id} style={styles.trackRow}>
                <Text style={styles.trackNum}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <TrackItem track={t} onPress={() => handlePlayTrack(i)} />
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingBottom: spacing.sm, position: 'absolute', top: 56, left: 0, right: 0, zIndex: 10 },
  backBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  hero: { height: 260, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroArt: { opacity: 1 },
  meta: { paddingHorizontal: spacing.base, paddingTop: spacing.lg },
  plName: { fontSize: typography.xxl, fontWeight: typography.extrabold, color: colors.textPrimary },
  plStats: { fontSize: typography.sm, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2 },
  actionBtnTxt: { fontSize: typography.base, fontWeight: typography.bold, color: colors.white },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 1, borderColor: colors.border },
  actionOutlineTxt: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.accentLight },
  iconAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tracksSection: { paddingHorizontal: spacing.base },
  tracksHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  tracksSectionTitle: { fontSize: typography.md, fontWeight: typography.bold, color: colors.textPrimary },
  trackRow: { flexDirection: 'row', alignItems: 'center' },
  trackNum: { width: 24, fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', marginRight: spacing.xs },
  emptyTracks: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTracksTxt: { fontSize: typography.sm, color: colors.textMuted },
});
