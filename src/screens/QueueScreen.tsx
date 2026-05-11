import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { QUEUE_TRACKS, NOW_PLAYING, Track } from '../data/mockData';

export default function QueueScreen() {
  const navigation = useNavigation<any>();
  const [queue, setQueue] = useState(QUEUE_TRACKS);

  const removeItem = (id: string) => setQueue((q) => q.filter((t) => t.id !== id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Queue</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="save-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setQueue([])}>
            <Ionicons name="trash-outline" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Now playing */}
      <View style={styles.nowSection}>
        <Text style={styles.sectionLabel}>NOW PLAYING</Text>
        <View style={styles.nowCard}>
          <View style={styles.nowArt}>
            <Ionicons name="musical-note" size={20} color={colors.accentLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nowTitle}>{NOW_PLAYING.title}</Text>
            <Text style={styles.nowArtist}>{NOW_PLAYING.artist}</Text>
          </View>
          <View style={styles.nowBars}>
            {[0.4, 0.8, 0.55, 0.9, 0.3].map((h, i) => (
              <View key={i} style={[styles.nowBar, { height: h * 20 }]} />
            ))}
          </View>
        </View>
      </View>

      {/* Up next */}
      <Text style={styles.upNextLabel}>UP NEXT — {queue.length} tracks</Text>

      {queue.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTxt}>Queue is empty</Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.queueRow}>
              <TouchableOpacity style={styles.dragHandle}>
                <Ionicons name="reorder-three" size={22} color={colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.queueArt}>
                <Ionicons name="musical-note" size={14} color={colors.textMuted} />
              </View>
              <View style={styles.queueInfo}>
                <Text style={styles.queueTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.queueArtist} numberOfLines={1}>{item.artist}</Text>
              </View>
              <Text style={styles.queueDuration}>{item.duration}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
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
  nowArtist: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  nowBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 20 },
  nowBar: { width: 3, backgroundColor: colors.accentLight, borderRadius: 2 },
  upNextLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  listPad: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm + 2 },
  dragHandle: { padding: spacing.xs },
  queueArt: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  queueInfo: { flex: 1 },
  queueTitle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  queueArtist: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  queueDuration: { fontSize: typography.xs, color: colors.textMuted },
  removeBtn: { padding: spacing.xs },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTxt: { fontSize: typography.md, color: colors.textMuted },
});
