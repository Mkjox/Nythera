import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { Track } from '../types/music';

type Props = {
  track: Track;
  onPress?: () => void;
  showMenu?: boolean;
};

export default function TrackItem({ track, onPress, showMenu = true }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Art */}
      <View style={styles.artWrapper}>
        <View style={styles.artBg}>
          <Ionicons name="musical-note" size={16} color={colors.accentLight} />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {track.isFavorite && (
          <Ionicons name="heart" size={14} color={colors.pink} style={styles.badge} />
        )}
        <Text style={styles.duration}>{track.duration}</Text>
        {showMenu && (
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }} style={styles.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.md,
  },
  artWrapper: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  artBg: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    marginRight: 2,
  },
  duration: {
    fontSize: typography.xs,
    color: colors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
  menuBtn: {
    paddingLeft: 4,
  },
});
