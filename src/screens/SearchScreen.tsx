import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { TRACKS, PLAYLISTS, ARTISTS } from '../data/mockData';
import TrackItem from '../components/TrackItem';

const RECENT_SEARCHES = ['Synthex', 'Late Night', 'Ambient', 'Luna Vera', 'Chill'];
const BROWSE_CATS = [
  { label: 'Pop', colorA: '#EC4899', colorB: '#7C3AED' },
  { label: 'Electronic', colorA: '#7C3AED', colorB: '#3B82F6' },
  { label: 'Ambient', colorA: '#06B6D4', colorB: '#3B82F6' },
  { label: 'Rock', colorA: '#EF4444', colorB: '#F97316' },
  { label: 'Hip-Hop', colorA: '#F59E0B', colorB: '#EF4444' },
  { label: 'Synthwave', colorA: '#5B21B6', colorB: '#EC4899' },
  { label: 'Jazz', colorA: '#22C55E', colorB: '#06B6D4' },
  { label: 'Classical', colorA: '#F97316', colorB: '#F59E0B' },
];

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const hasQuery = query.length > 0;
  const filteredTracks = TRACKS.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase())
  );
  const filteredPlaylists = PLAYLISTS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Tracks, playlists, artists…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {hasQuery && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {hasQuery && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.cancelBtn}>
            <Text style={styles.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!hasQuery ? (
          <>
            {/* Recent searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <View style={styles.recentList}>
                {RECENT_SEARCHES.map((s) => (
                  <TouchableOpacity key={s} style={styles.recentItem} onPress={() => setQuery(s)}>
                    <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.recentTxt}>{s}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Browse categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by Genre</Text>
              <View style={styles.grid}>
                {BROWSE_CATS.map((cat) => (
                  <TouchableOpacity key={cat.label} style={[styles.catCard, { backgroundColor: cat.colorA }]} activeOpacity={0.8}>
                    <View style={[styles.catOverlay, { backgroundColor: cat.colorB + '55' }]} />
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <Ionicons name="musical-notes" size={32} color="rgba(255,255,255,0.2)" style={styles.catIcon} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Track results */}
            {filteredTracks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Songs ({filteredTracks.length})</Text>
                {filteredTracks.map((t) => (
                  <TrackItem key={t.id} track={t} onPress={() => navigation.navigate('NowPlaying')} />
                ))}
              </View>
            )}

            {/* Playlist results */}
            {filteredPlaylists.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Playlists ({filteredPlaylists.length})</Text>
                {filteredPlaylists.map((pl) => (
                  <TouchableOpacity key={pl.id} style={styles.plItem} onPress={() => navigation.navigate('Playlist', { playlist: pl })}>
                    <View style={[styles.plArt, { backgroundColor: pl.colorA }]}>
                      <Ionicons name="musical-notes" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.plName}>{pl.name}</Text>
                      <Text style={styles.plMeta}>{pl.trackCount} tracks • Playlist</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filteredTracks.length === 0 && filteredPlaylists.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No results for "{query}"</Text>
                <Text style={styles.emptySub}>Try a different keyword or check the spelling</Text>
              </View>
            )}
          </>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  input: { flex: 1, fontSize: typography.base, color: colors.textPrimary, padding: 0 },
  cancelBtn: { paddingHorizontal: spacing.xs },
  cancelTxt: { fontSize: typography.base, color: colors.accentLight, fontWeight: typography.medium },
  section: { paddingHorizontal: spacing.base, marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.md, fontWeight: typography.bold, color: colors.textPrimary, marginBottom: spacing.md },
  recentList: { gap: 2 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  recentTxt: { fontSize: typography.base, color: colors.textSecondary, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catCard: { width: '48%', height: 76, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end', padding: spacing.md },
  catOverlay: { ...StyleSheet.absoluteFillObject },
  catLabel: { fontSize: typography.md, fontWeight: typography.bold, color: colors.white, zIndex: 1 },
  catIcon: { position: 'absolute', top: 8, right: 8 },
  plItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  plArt: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  plName: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  plMeta: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textSecondary },
  emptySub: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
});
