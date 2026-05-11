import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { TRACKS, PLAYLISTS, Playlist } from '../data/mockData';
import TrackItem from '../components/TrackItem';

export default function PlaylistScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const playlist: Playlist = route.params?.playlist ?? PLAYLISTS[0];
  const [isFollowing, setIsFollowing] = useState(false);

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
            <Ionicons name="musical-notes" size={72} color="rgba(255,255,255,0.35)" />
          </View>
        </View>

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={styles.plName}>{playlist.name}</Text>
          <Text style={styles.plDesc}>{playlist.description}</Text>
          <Text style={styles.plStats}>{playlist.trackCount} songs • 1 hr 42 min</Text>

          {/* Action row */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('NowPlaying')}>
              <Ionicons name="play" size={18} color={colors.white} />
              <Text style={styles.actionBtnTxt}>Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline} onPress={() => navigation.navigate('NowPlaying')}>
              <Ionicons name="shuffle" size={16} color={colors.accentLight} />
              <Text style={styles.actionOutlineTxt}>Shuffle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={() => setIsFollowing(!isFollowing)}>
              <Ionicons name={isFollowing ? 'heart' : 'heart-outline'} size={22} color={isFollowing ? colors.pink : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}>
              <Ionicons name="download-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction}>
              <Ionicons name="share-social-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tracks */}
        <View style={styles.tracksSection}>
          <View style={styles.tracksHeader}>
            <Text style={styles.tracksSectionTitle}>Tracks</Text>
            <TouchableOpacity style={styles.addTrackBtn}>
              <Ionicons name="add" size={18} color={colors.accentLight} />
              <Text style={styles.addTrackTxt}>Add Songs</Text>
            </TouchableOpacity>
          </View>
          {TRACKS.map((t, i) => (
            <View key={t.id} style={styles.trackRow}>
              <Text style={styles.trackNum}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <TrackItem track={t} onPress={() => navigation.navigate('NowPlaying')} />
              </View>
            </View>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsTitle}>About this playlist</Text>
          <Text style={styles.creditsBody}>{playlist.description} — curated for those late-hour sessions when only the right track matters.</Text>
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
  plDesc: { fontSize: typography.base, color: colors.textSecondary, marginTop: spacing.xs },
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
  addTrackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addTrackTxt: { fontSize: typography.sm, color: colors.accentLight, fontWeight: typography.medium },
  trackRow: { flexDirection: 'row', alignItems: 'center' },
  trackNum: { width: 24, fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', marginRight: spacing.xs },
  credits: { margin: spacing.base, padding: spacing.base, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  creditsTitle: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.textSecondary, marginBottom: spacing.xs },
  creditsBody: { fontSize: typography.sm, color: colors.textMuted, lineHeight: 20 },
});
