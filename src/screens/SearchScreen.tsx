import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary, usePlayer } from '../store/MusicProvider';
import TrackItem from '../components/TrackItem';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const { getAllTracks, playlists } = useLibrary();
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const hasQuery = query.length > 0;

  const allTracks = getAllTracks();

  const filteredTracks = hasQuery
    ? allTracks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredPlaylists = hasQuery
    ? playlists.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handlePlayTrack = useCallback((track: any, index: number) => {
    playTrack(track, filteredTracks, index);
  }, [filteredTracks, playTrack]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search tracks, folders…"
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
          <View style={styles.browseHint}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.browseTitle}>Search your library</Text>
            <Text style={styles.browseSub}>Find tracks and folders by name</Text>
          </View>
        ) : (
          <>
            {/* Track results */}
            {filteredTracks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Songs ({filteredTracks.length})</Text>
                {filteredTracks.map((t, i) => (
                  <TrackItem key={t.id} track={t} onPress={() => handlePlayTrack(t, i)} />
                ))}
              </View>
            )}

            {/* Playlist results */}
            {filteredPlaylists.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Folders ({filteredPlaylists.length})</Text>
                {filteredPlaylists.map((pl) => (
                  <TouchableOpacity key={pl.id} style={styles.plItem} onPress={() => navigation.navigate('Playlist', { playlistId: pl.id })}>
                    <View style={[styles.plArt, { backgroundColor: pl.colorA }]}>
                      <Ionicons name="folder" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.plName}>{pl.name}</Text>
                      <Text style={styles.plMeta}>{pl.trackCount} tracks • Folder</Text>
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
                <Text style={styles.emptySub}>Try a different keyword</Text>
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
  browseHint: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  browseTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textSecondary },
  browseSub: { fontSize: typography.sm, color: colors.textMuted },
  section: { paddingHorizontal: spacing.base, marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.md, fontWeight: typography.bold, color: colors.textPrimary, marginBottom: spacing.md },
  plItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  plArt: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  plName: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  plMeta: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyTitle: { fontSize: typography.md, fontWeight: typography.semibold, color: colors.textSecondary },
  emptySub: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
});
