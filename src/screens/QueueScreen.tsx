import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { usePlayer, useMusicStore } from '../store/MusicProvider';

export default function QueueScreen() {
  const navigation = useNavigation<any>();
  const { state, dispatch } = useMusicStore();
  const { currentTrack, queue, queueIndex, isPlaying, playTrack } = usePlayer();

  const upNext = queue.slice(queueIndex + 1);

  const handlePlayFromQueue = useCallback((index: number) => {
    const actualIndex = queueIndex + 1 + index;
    if (actualIndex < queue.length) {
      playTrack(queue[actualIndex], queue, actualIndex);
    }
  }, [queue, queueIndex, playTrack]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Queue</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => dispatch({ type: 'SET_QUEUE', queue: [] })}>
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Now playing */}
      {currentTrack && (
        <View style={styles.nowSection}>
          <Text style={styles.sectionLabel}>NOW PLAYING</Text>
          <View style={styles.nowCard}>
            <View style={styles.nowArt}>
              <Ionicons name="musical-note" size={20} color={colors.accentLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nowTitle}>{currentTrack.title}</Text>
            </View>
            {isPlaying && (
              <View style={styles.nowBars}>
                {[0.4, 0.8, 0.55, 0.9, 0.3].map((h, i) => (
                  <View key={i} style={[styles.nowBar, { height: h * 20 }]} />
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* Up next */}
      <Text style={styles.upNextLabel}>UP NEXT — {upNext.length} tracks</Text>

      {upNext.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTxt}>Queue is empty</Text>
        </View>
      ) : (
        <FlatList
          data={upNext}
          keyExtractor={(t, i) => t.id + i}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.queueRow} onPress={() => handlePlayFromQueue(index)} activeOpacity={0.7}>
              <View style={styles.queueArt}>
                <Ionicons name="musical-note" size={14} color={colors.textMuted} />
              </View>
              <View style={styles.queueInfo}>
                <Text style={styles.queueTitle} numberOfLines={1}>{item.title}</Text>
              </View>
              <Text style={styles.queueDuration}>{item.duration}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  backBtn: { marginRight: spacing.sm },
  title: { flex: 1, fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  headerRight: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { padding: spacing.xs + 2 },
  nowSection: { paddingHorizontal: spacing.base, marginBottom: spacing.base },
  sectionLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
  nowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.lg, padding: spacing.md },
  nowArt: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.accent },
  nowTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },
  nowBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 },
  nowBar: { width: 3, backgroundColor: colors.accentLight, borderRadius: 2 },
  upNextLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  listPad: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 2 },
  queueArt: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  queueInfo: { flex: 1 },
  queueTitle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  queueDuration: { fontSize: typography.xs, color: colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTxt: { fontSize: typography.md, color: colors.textMuted },
});
