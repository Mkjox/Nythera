import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { DOWNLOADS } from '../data/mockData';

export default function DownloadsScreen() {
  const navigation = useNavigation<any>();
  const [offlineOnly, setOfflineOnly] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Downloads</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Storage card */}
      <View style={styles.storageCard}>
        <View style={styles.storageTop}>
          <View style={styles.storageIcon}>
            <Ionicons name="phone-portrait-outline" size={22} color={colors.accentLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.storageTitle}>Device Storage</Text>
            <Text style={styles.storageSub}>1.2 GB used of 3.5 GB available</Text>
          </View>
          <Text style={styles.storagePercent}>34%</Text>
        </View>
        <View style={styles.storageBarBg}>
          <View style={[styles.storageBarFill, { width: '34%' }]} />
        </View>
        <View style={styles.storageStats}>
          <View style={styles.storageStat}>
            <Ionicons name="musical-notes" size={14} color={colors.accentLight} />
            <Text style={styles.storageStatTxt}>7 tracks downloaded</Text>
          </View>
          <TouchableOpacity style={styles.autoDeleteBtn}>
            <Ionicons name="timer-outline" size={13} color={colors.textMuted} />
            <Text style={styles.autoDeleteTxt}>Auto-delete old</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline toggle */}
      <TouchableOpacity style={styles.offlineRow} onPress={() => setOfflineOnly(!offlineOnly)}>
        <Ionicons name="wifi-outline" size={18} color={offlineOnly ? colors.accentLight : colors.textMuted} />
        <Text style={[styles.offlineTxt, offlineOnly && { color: colors.accentLight }]}>Offline-only mode</Text>
        <View style={[styles.toggle, offlineOnly && styles.toggleOn]}>
          <View style={[styles.toggleThumb, offlineOnly && styles.toggleThumbOn]} />
        </View>
      </TouchableOpacity>

      <FlatList
        data={DOWNLOADS}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.artBox}>
              <Ionicons name="musical-note" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.rowArtist}>{item.artist}</Text>
              {item.status === 'downloading' && (
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                </View>
              )}
              {item.status === 'paused' && (
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${item.progress * 100}%`, backgroundColor: colors.yellow }]} />
                </View>
              )}
            </View>
            <View style={styles.rowRight}>
              {item.status === 'done' && (
                <Ionicons name="checkmark-circle" size={20} color={colors.green} />
              )}
              {item.status === 'downloading' && (
                <TouchableOpacity>
                  <Ionicons name="pause-circle" size={20} color={colors.accentLight} />
                </TouchableOpacity>
              )}
              {item.status === 'paused' && (
                <TouchableOpacity>
                  <Ionicons name="play-circle" size={20} color={colors.yellow} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.menuBtn}>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  backBtn: { marginRight: spacing.sm },
  title: { flex: 1, fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  iconBtn: { padding: spacing.xs + 2 },
  storageCard: { marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.base },
  storageTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  storageIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.accent },
  storageTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },
  storageSub: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  storagePercent: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.accentLight },
  storageBarBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: spacing.sm },
  storageBarFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  storageStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storageStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storageStatTxt: { fontSize: typography.xs, color: colors.textMuted },
  autoDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  autoDeleteTxt: { fontSize: typography.xs, color: colors.textMuted },
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm },
  offlineTxt: { flex: 1, fontSize: typography.base, color: colors.textMuted },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: colors.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleThumbOn: { backgroundColor: colors.white, alignSelf: 'flex-end' },
  list: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  artBox: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  rowArtist: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  progressBg: { height: 3, backgroundColor: colors.border, borderRadius: 2, marginTop: 6 },
  progressFill: { height: 3, backgroundColor: colors.accentLight, borderRadius: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  menuBtn: { padding: 4 },
});
