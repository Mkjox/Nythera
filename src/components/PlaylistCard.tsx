import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { Playlist } from '../types/music';

type Props = {
  playlist: Playlist;
  onPress?: () => void;
  onDelete?: () => void;
  size?: number;
};

export default function PlaylistCard({ playlist, onPress, onDelete, size = 150 }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { width: size }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Art */}
      <View style={[styles.art, { height: size, backgroundColor: playlist.colorA }]}> 
        {/* optional delete button */}
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        )}
        <View style={[styles.artOverlay, { backgroundColor: playlist.colorB + '55' }]} />
        <View style={styles.artIconWrapper}>
          <Ionicons name="folder-open" size={size * 0.28} color="rgba(255,255,255,0.9)" />
        </View>
        {/* Play button overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={14} color={colors.white} />
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
        <Text style={styles.count}>{playlist.trackCount} tracks</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  art: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  artIconWrapper: {
    opacity: 0.6,
  },
  playOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingTop: spacing.sm,
    paddingHorizontal: 2,
  },
  name: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  count: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.32)',
    padding: 6,
    borderRadius: 14,
    zIndex: 2,
  },
});
