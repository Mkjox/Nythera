import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { TRACKS, PLAYLISTS, ARTISTS, FEATURED_PLAYLIST, SUGGESTED_PLAYLISTS, RECENT_TRACKS } from '../data/mockData';
import PlaylistCard from '../components/PlaylistCard';
import TrackItem from '../components/TrackItem';
import SectionHeader from '../components/SectionHeader';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good evening 👋</Text>
            <Text style={styles.headerTitle}>What do you feel like?</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color={colors.accentLight} />
            </View>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
          {[{ icon: 'shuffle', label: 'Shuffle All' }, { icon: 'heart', label: 'Liked' }, { icon: 'time-outline', label: 'Recent' }, { icon: 'download', label: 'Offline' }].map((c) => (
            <TouchableOpacity key={c.label} style={styles.chip}>
              <Ionicons name={c.icon as any} size={14} color={colors.accentLight} />
              <Text style={styles.chipText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured banner */}
        <TouchableOpacity style={[styles.featured, { backgroundColor: FEATURED_PLAYLIST.colorA }]} activeOpacity={0.85} onPress={() => navigation.navigate('Playlist', { playlist: FEATURED_PLAYLIST })}>
          <View style={[styles.featuredOverlay, { backgroundColor: FEATURED_PLAYLIST.colorB + '66' }]} />
          <View style={styles.featuredLeft}>
            <Text style={styles.featuredEyebrow}>FEATURED MIX</Text>
            <Text style={styles.featuredTitle}>{FEATURED_PLAYLIST.name}</Text>
            <Text style={styles.featuredDesc}>{FEATURED_PLAYLIST.description}</Text>
            <View style={styles.featuredPlay}>
              <Ionicons name="play" size={13} color={colors.white} />
              <Text style={styles.featuredPlayTxt}>Play Now</Text>
            </View>
          </View>
          <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>

        {/* Made for you */}
        <View style={styles.section}>
          <SectionHeader title="Made for You" actionLabel="See all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {SUGGESTED_PLAYLISTS.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onPress={() => navigation.navigate('Playlist', { playlist: pl })} size={148} />
            ))}
          </ScrollView>
        </View>

        {/* Artists */}
        <View style={styles.section}>
          <SectionHeader title="Artists You Love" actionLabel="See all" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {ARTISTS.map((a) => (
              <TouchableOpacity key={a.id} style={styles.artistItem}>
                <View style={styles.artistArt}>
                  <Ionicons name="person" size={26} color={colors.accentLight} />
                </View>
                <Text style={styles.artistName} numberOfLines={1}>{a.name}</Text>
                <Text style={styles.artistGenre}>{a.genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent tracks */}
        <View style={styles.section}>
          <SectionHeader title="Recently Played" actionLabel="History" onAction={() => navigation.navigate('History')} />
          {RECENT_TRACKS.map((t) => (
            <TrackItem key={t.id} track={t} onPress={() => navigation.navigate('NowPlaying')} />
          ))}
        </View>

        {/* More playlists */}
        <View style={styles.section}>
          <SectionHeader title="More Playlists" actionLabel="Library" onAction={() => navigation.navigate('Library')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {PLAYLISTS.slice(2).map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} onPress={() => navigation.navigate('Playlist', { playlist: pl })} size={130} />
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
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
  artistItem: { width: 88, alignItems: 'center' },
  artistArt: { width: 70, height: 70, borderRadius: radius.full, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  artistName: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textPrimary, textAlign: 'center' },
  artistGenre: { fontSize: typography.xs, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
});
