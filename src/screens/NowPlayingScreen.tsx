import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Alert, Share } from 'react-native';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { colors, spacing, radius, typography } from '../theme';
import { usePlayer, useMusicStore } from '../store/MusicProvider';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SPEED_LABELS = ['0.5×', '0.75×', '1×', '1.25×', '1.5×', '2×'];

export default function NowPlayingScreen() {
  const navigation = useNavigation<any>();
  const { state, dispatch } = useMusicStore();
  const { currentTrack, isPlaying, positionMs, durationMs, shuffle, repeat, togglePlayPause, nextTrack, prevTrack, seekTo } = usePlayer();
  const [speedIdx, setSpeedIdx] = React.useState(2);

  // useProgress gives more frequent native updates for smooth UI
  const prog = useProgress(250);
  const progPosMs = Math.floor((prog.position || 0) * 1000);
  // fall back to state.durationMs if native duration is temporarily unavailable
  const nativeDurMs = Math.floor((prog.duration || 0) * 1000);
  const progDurMs = nativeDurMs > 0 ? nativeDurMs : state.durationMs;
  const progress = progDurMs > 0 ? progPosMs / progDurMs : 0;
  const currentSec = Math.floor((prog.position || (state.positionMs / 1000)));
  const totalSec = Math.floor(progDurMs / 1000);

  const [barWidth, setBarWidth] = React.useState(1);
  const [dragRatio, setDragRatio] = React.useState<number | null>(null);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekMove = useCallback((event: any, commit: boolean) => {
    const { locationX } = event.nativeEvent;
    const ratio = barWidth > 0 ? Math.max(0, Math.min(1, locationX / barWidth)) : 0;
    setDragRatio(ratio);
    if (commit) {
      seekTo(ratio * progDurMs);
      setDragRatio(null);
    }
  }, [barWidth, progDurMs, seekTo]);

  const handleSpeedChange = useCallback(async () => {
    const newIdx = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(newIdx);
    const { setPlaybackSpeed } = require('../services/audioService');
    await setPlaybackSpeed(SPEEDS[newIdx]);
  }, [speedIdx]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
            <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topCenter}>
            <Text style={styles.topEyebrow}>NOW PLAYING</Text>
          </View>
          <View style={styles.topBtn} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontSize: typography.md }}>No track playing</Text>
          <Text style={{ color: colors.textMuted, fontSize: typography.sm }}>Select a track from your library</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topEyebrow}>NOW PLAYING</Text>
        </View>
        <TouchableOpacity
          style={styles.topBtn}
          onPress={() => {
            Alert.alert('Options', undefined, [
              { text: 'Open Queue', onPress: () => navigation.navigate('Queue') },
              { text: 'Share Track', onPress: async () => {
                try {
                  if (currentTrack) {
                    await Share.share({ message: `${currentTrack.title}` });
                  }
                } catch (e) {
                  console.warn(e);
                }
              } },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
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
          <Text style={styles.trackTitle} numberOfLines={2}>{currentTrack.title}</Text>
        </View>
        <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_FAVORITE', trackId: currentTrack.id })} style={styles.favBtn}>
          <Ionicons
            name={currentTrack.isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={currentTrack.isFavorite ? colors.pink : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Seek bar */}
      <View style={styles.seekContainer}>
        <View
          style={styles.seekTrack}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) => handleSeekMove(e, false)}
          onResponderMove={(e) => handleSeekMove(e, false)}
          onResponderRelease={(e) => handleSeekMove(e, true)}
        >
          <View style={[styles.seekFill, { width: `${(dragRatio ?? progress) * 100}%` }]} />
          <View style={[styles.seekThumb, { left: `${(dragRatio ?? progress) * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeTxt}>{formatTime(currentSec)}</Text>
          <Text style={styles.timeTxt}>-{formatTime(Math.max(0, totalSec - currentSec))}</Text>
        </View>
      </View>

      {/* Main controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => dispatch({ type: 'SET_SHUFFLE', value: !shuffle })}>
          <Ionicons name="shuffle" size={22} color={shuffle ? colors.accentLight : colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={prevTrack}>
          <Ionicons name="play-skip-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const next = repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off';
          dispatch({ type: 'SET_REPEAT', value: next });
        }}>
          <View>
            <Ionicons name="repeat-outline" size={22} color={repeat !== 'off' ? colors.accentLight : colors.textMuted} />
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
        <TouchableOpacity style={styles.secBtn} onPress={handleSpeedChange}>
          <Text style={[styles.speedBadge, speedIdx !== 2 && { color: colors.accentLight }]}>{SPEED_LABELS[speedIdx]}</Text>
          <Text style={styles.secTxt}>Speed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secBtn} onPress={() => navigation.navigate('Output')}>
          <Ionicons name="bluetooth" size={20} color={colors.textSecondary} />
          <Text style={styles.secTxt}>Output</Text>
        </TouchableOpacity>
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
  artContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl, position: 'relative' },
  artGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: colors.accentGlow, transform: [{ scaleX: 1.3 }] },
  artFrame: { width: 240, height: 240, borderRadius: radius.xxl, overflow: 'hidden', shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 16 },
  artInner: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xxl, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  infoLeft: { flex: 1 },
  trackTitle: { fontSize: typography.xl, fontWeight: typography.extrabold, color: colors.textPrimary },
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
  secondary: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.base, marginBottom: spacing.lg },
  secBtn: { alignItems: 'center', gap: 4 },
  secTxt: { fontSize: typography.xs, color: colors.textMuted },
  speedBadge: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.textSecondary, height: 20, lineHeight: 20 },
});
