import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { NOW_PLAYING, TRACKS } from '../data/mockData';

const SPEEDS = ['0.5×', '0.75×', '1×', '1.25×', '1.5×', '2×'];

export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const track = NOW_PLAYING;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFav, setIsFav] = useState(track.isFavorite);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [shuffle, setShuffle] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(2);
  const [showQueue, setShowQueue] = useState(false);
  const progress = 0.38;

  const repeatIcon = repeat === 'one' ? 'repeat-outline' : 'repeat-outline';
  const repeatColor = repeat !== 'off' ? colors.accentLight : colors.textMuted;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topEyebrow}>NOW PLAYING</Text>
          <Text style={styles.topPlaylist} numberOfLines={1}>Late Night Drive</Text>
        </View>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Album Art */}
      <View style={styles.artContainer}>
        <View style={styles.artGlow} />
        <View style={styles.artFrame}>
          <View style={styles.artInner}>
            <Ionicons name="musical-note" size={96} color={colors.accentLight} />
          </View>
        </View>
      </View>

      {/* Track info + fav */}
      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackArtist}>{track.artist} • {track.album}</Text>
        </View>
        <TouchableOpacity onPress={() => setIsFav(!isFav)} style={styles.favBtn}>
          <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={26} color={isFav ? colors.pink : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Seek bar */}
      <View style={styles.seekContainer}>
        <View style={styles.seekTrack}>
          <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.seekThumb, { left: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeTxt}>{Math.floor(track.durationSec * progress / 60)}:{String(Math.floor(track.durationSec * progress % 60)).padStart(2, '0')}</Text>
          <Text style={styles.timeTxt}>-{Math.floor(track.durationSec * (1 - progress) / 60)}:{String(Math.floor(track.durationSec * (1 - progress) % 60)).padStart(2, '0')}</Text>
        </View>
      </View>

      {/* Main controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setShuffle(!shuffle)}>
          <Ionicons name="shuffle" size={22} color={shuffle ? colors.accentLight : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn}>
          <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseBtn} onPress={() => setIsPlaying(!isPlaying)}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn}>
          <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}>
          <View>
            <Ionicons name="repeat-outline" size={22} color={repeatColor} />
            {repeat === 'one' && <View style={styles.repeatOneDot} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Secondary controls */}
      <View style={styles.secondary}>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.navigate('Queue')}>
          <Ionicons name="list" size={20} color={colors.textSecondary} />
          <Text style={styles.secTxt}>Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.secTxt}>Add to</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn} onPress={() => setSpeedIdx((speedIdx + 1) % SPEEDS.length)}>
          <Text style={[styles.speedBadge, speedIdx !== 2 && { color: colors.accentLight }]}>{SPEEDS[speedIdx]}</Text>
          <Text style={styles.secTxt}>Speed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.navigate('Output')}>
          <Ionicons name="bluetooth" size={20} color={colors.textSecondary} />
          <Text style={styles.secTxt}>Output</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn}>
          <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.secTxt}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Volume */}
      <View style={styles.volumeRow}>
        <Ionicons name="volume-low" size={18} color={colors.textMuted} />
        <View style={styles.volTrack}>
          <View style={[styles.volFill, { width: '70%' }]} />
          <View style={[styles.volThumb, { left: '70%' }]} />
        </View>
        <Ionicons name="volume-high" size={18} color={colors.textMuted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  topBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topCenter: { flex: 1, alignItems: 'center' },
  topEyebrow: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5 },
  topPlaylist: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary, marginTop: 2 },
  artContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, position: 'relative' },
  artGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: colors.accentGlow, transform: [{ scaleX: 1.3 }] },
  artFrame: { width: 240, height: 240, borderRadius: radius.xxl, overflow: 'hidden', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 16 },
  artInner: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  infoLeft: { flex: 1 },
  trackTitle: { fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.textPrimary },
  trackArtist: { fontSize: typography.base, color: colors.textSecondary, marginTop: spacing.xs },
  favBtn: { padding: spacing.sm },
  seekContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  seekTrack: { height: 4, backgroundColor: colors.border, borderRadius: 2, position: 'relative', marginBottom: spacing.sm },
  seekFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  seekThumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, marginLeft: -8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeTxt: { fontSize: typography.xs, color: colors.textMuted },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xxl, marginBottom: spacing.xl },
  skipBtn: { padding: spacing.sm },
  playPauseBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  repeatOneDot: { position: 'absolute', bottom: -4, alignSelf: 'center', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accentLight },
  secondary: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.base, marginBottom: spacing.lg },
  secBtn: { alignItems: 'center', gap: 4 },
  secTxt: { fontSize: typography.xs, color: colors.textMuted },
  speedBadge: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.textSecondary, height: 20, lineHeight: 20 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  volTrack: { flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2, position: 'relative' },
  volFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  volThumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, marginLeft: -8 },
});
