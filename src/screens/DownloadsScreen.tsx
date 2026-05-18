import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary } from '../store/MusicProvider';
import { scanAudioFiles, requestMediaPermission } from '../services/scanService';

export default function DownloadsScreen() {
  const navigation = useNavigation<any>();
  const { playlists, getAllTracks, hasPermission, dispatch, removeFolder } = useLibrary();
  const allTracks = getAllTracks();
  const totalFolders = playlists.length;
  const totalTracks = allTracks.length;

  const handleRescan = useCallback(async () => {
    let perm = hasPermission;
    if (!perm) {
      perm = await requestMediaPermission();
      dispatch({ type: 'SET_PERMISSION', value: perm });
    }
    if (!perm) return;
    dispatch({ type: 'SET_SCANNING', value: true });
    try {
      const { tracks, playlists: scanned } = await scanAudioFiles();
      const map: Record<string, any> = {};
      for (const t of tracks) map[t.id] = t;
      dispatch({ type: 'SET_LIBRARY', tracks: map, playlists: scanned });
    } catch (e) { console.warn(e); }
    dispatch({ type: 'SET_SCANNING', value: false });
  }, [hasPermission, dispatch]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Remove Folder', `Remove "${name}" and all its tracks?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFolder(id) },
    ]);
  }, [removeFolder]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Local Storage</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={handleRescan}>
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Ionicons name="folder" size={20} color={colors.accentLight} />
            <Text style={styles.statNum}>{totalFolders}</Text>
            <Text style={styles.statLabel}>Folders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="musical-notes" size={20} color={colors.accentLight} />
            <Text style={styles.statNum}>{totalTracks}</Text>
            <Text style={styles.statLabel}>Tracks</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>IMPORTED FOLDERS</Text>

      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTxt}>No folders imported yet</Text>
          <TouchableOpacity style={styles.scanBtn} onPress={handleRescan}>
            <Text style={styles.scanBtnTxt}>Scan Device</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(pl) => pl.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.folderRow}>
              <View style={[styles.folderIcon, { backgroundColor: item.colorA + '33' }]}>
                <Ionicons name="folder" size={22} color={item.colorA} />
              </View>
              <View style={styles.folderInfo}>
                <Text style={styles.folderName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.folderMeta}>{item.trackCount} tracks</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.red} />
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
  iconBtn: { padding: spacing.xs + 2 },
  statsCard: { marginHorizontal: spacing.base, marginBottom: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.base },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  statLabel: { fontSize: typography.xs, color: colors.textMuted },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border },
  sectionLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: spacing.base, marginBottom: spacing.sm, marginTop: spacing.sm },
  list: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  folderIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  folderInfo: { flex: 1 },
  folderName: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  folderMeta: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: spacing.sm },
  empty: { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyTxt: { fontSize: typography.md, color: colors.textMuted },
  scanBtn: { backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, marginTop: spacing.sm },
  scanBtnTxt: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.white },
});
