import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { usePlayer } from '../store/MusicProvider';

type Props = {
  onPress?: () => void;
};

export default function MiniPlayer({ onPress }: Props) {
  const navigation = useNavigation<any>();
  const { currentTrack, isPlaying, positionMs, durationMs, togglePlayPause, nextTrack, prevTrack } = usePlayer();

  // Hide when no track is loaded
  if (!currentTrack) return null;

  const progress = durationMs > 0 ? positionMs / durationMs : 0;

  const handlePress = () => {
    if (onPress) onPress();
    navigation.navigate('NowPlaying');
  };

  return (
    <View style={styles.wrapper}>
      {/* Progress bar at the very top */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.85}>
        {/* Album icon */}
        <View style={styles.artWrapper}>
          <View style={styles.artBg}>
            <Ionicons name="musical-note" size={20} color={colors.accentLight} />
          </View>
        </View>

        {/* Track info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.ctrlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={prevTrack}>
            <Ionicons name="play-skip-back" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctrlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={nextTrack}>
            <Ionicons name="play-skip-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
  progressTrack: {
    height: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  artWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  artBg: {
    flex: 1,
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ctrlBtn: {
    padding: spacing.xs,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
