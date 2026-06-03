import React, { useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary, usePlayer } from '../store/MusicProvider';
import { scanAudioFiles, requestMediaPermission } from '../services/scanService';
import TrackItem from '../components/TrackItem';
import PlaylistCard from '../components/PlaylistCard';
import SectionHeader from '../components/SectionHeader';

const TABS = ['Songs', 'Playlists', 'Folders'];
const SORTS = ['Default', 'Title', 'Duration'];

export default function LibraryScreen() {
  const navigation = useNavigation<any>();
  const { playlists, isScanning, hasPermission, dispatch, getAllTracks, removeFolder } = useLibrary();
  const { playTrack } = usePlayer();
  const [activeTab, setActiveTab] = useState('Songs');
  const [activeSort, setActiveSort] = useState('Default');
  const [titleAsc, setTitleAsc] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const sortedTracks = useMemo(() => {
    const all = getAllTracks();
    const copy = [...all];
    if (activeSort === 'Title') return copy.sort((a, b) => titleAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
    if (activeSort === 'Duration') return copy.sort((a, b) => a.durationSec - b.durationSec);
    return copy;
  }, [getAllTracks, activeSort, titleAsc]);

  const sortedPlaylists = useMemo(() => {
    const copy = [...playlists];
    if (activeSort === 'Title') return copy.sort((a, b) => titleAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    if (activeSort === 'Duration') return copy.sort((a, b) => a.trackCount - b.trackCount);
    return copy;
  }, [playlists, activeSort, titleAsc]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleImport = useCallback(async () => {
    let perm = hasPermission;
    if (!perm) {
      perm = await requestMediaPermission();
      dispatch({ type: 'SET_PERMISSION', value: perm });
    }
    if (!perm) return;

    dispatch({ type: 'SET_SCANNING', value: true });
    try {
      const { tracks, playlists: scannedPlaylists } = await scanAudioFiles();
      const trackMap: Record<string, any> = {};
      for (const t of tracks) trackMap[t.id] = t;
      dispatch({ type: 'SET_LIBRARY', tracks: trackMap, playlists: scannedPlaylists });
    } catch (e) {
      console.warn('Scan error:', e);
    }
    dispatch({ type: 'SET_SCANNING', value: false });
  }, [hasPermission, dispatch]);

  const handleDeleteFolder = useCallback((playlistId: string, name: string) => {
    Alert.alert(
      'Remove Folder',
      `Are you sure you want to remove "${name}" and all its tracks from your library?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFolder(playlistId) },
      ]
    );
  }, [removeFolder]);

  const handlePlayTrack = useCallback((track: any, index: number) => {
    playTrack(track, sortedTracks, index);
  }, [sortedTracks, playTrack]);
  const handlePlayTrackAndMaybeOpen = useCallback(async (track: any, index: number) => {
    playTrack(track, sortedTracks, index);
    try {
      const val = await AsyncStorage.getItem('@nythera_open_player_on_play');
      if (val === '1') navigation.navigate('NowPlaying');
    } catch (e) { /* ignore */ }
  }, [sortedTracks, playTrack, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.headerRight}>
          {activeTab === 'Songs' && (
            <TouchableOpacity style={styles.iconBtn} onPress={() => { setMultiSelect(!multiSelect); setSelected([]); }}>
              <Ionicons name={multiSelect ? 'checkmark-done' : 'checkbox-outline'} size={22} color={multiSelect ? colors.accentLight : colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={handleImport}>
            <Ionicons name={isScanning ? 'sync' : 'scan-outline'} size={22} color={isScanning ? colors.accentLight : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort bar */}
      { (activeTab === 'Songs' || activeTab === 'Folders') && (
        <View style={styles.sortBar}>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(!sortOpen)}>
            <Ionicons name="filter" size={15} color={colors.textSecondary} />
            <Text style={styles.sortTxt}>{activeSort === 'Title' ? `Title ${titleAsc ? 'A→Z' : 'Z→A'}` : activeSort}</Text>
            <Ionicons name={sortOpen ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.countTxt}>{activeTab === 'Songs' ? sortedTracks.length : sortedPlaylists.length} items</Text>
        </View>
      )}

      {/* Sort dropdown */}
      {sortOpen && (
        <View style={styles.dropdown}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s}
              style={styles.dropItem}
              onPress={() => {
                if (s === 'Title') {
                  if (activeSort === 'Title') {
                    setTitleAsc(!titleAsc);
                  } else {
                    setActiveSort('Title');
                    setTitleAsc(true);
                  }
                } else {
                  setActiveSort(s);
                }
                setSortOpen(false);
              }}
            >
              <Text style={[styles.dropItemTxt, s === activeSort && { color: colors.accentLight }]}>{s}</Text>
              {s === activeSort && <Ionicons name="checkmark" size={16} color={colors.accentLight} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Multi-select action bar */}
      {multiSelect && selected.length > 0 && (
        <View style={styles.multiBar}>
          <Text style={styles.multiCount}>{selected.length} selected</Text>
          <View style={styles.multiActions}>
            <TouchableOpacity style={styles.multiAction} onPress={() => {
              for (const id of selected) dispatch({ type: 'TOGGLE_FAVORITE', trackId: id });
              setSelected([]);
            }}>
              <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.multiActionTxt}>Favorite</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'Songs' ? (
        sortedTracks.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTxt}>No songs found</Text>
            <Text style={styles.emptySub}>Scan your device to import music</Text>
          </View>
        ) : (
          <FlatList
            data={sortedTracks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <View style={[styles.selectableRow, multiSelect && selected.includes(item.id) && styles.selectedRow]}>
                {multiSelect && (
                  <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkBtn}>
                    <View style={[styles.checkbox, selected.includes(item.id) && styles.checkboxChecked]}>
                      {selected.includes(item.id) && <Ionicons name="checkmark" size={12} color={colors.white} />}
                    </View>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                  <TrackItem track={item} onPress={() => handlePlayTrack(item, index)} />
                </View>
              </View>
            )}
            ListFooterComponent={<View style={{ height: 24 }} />}
          />
        )
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {activeTab === 'Playlists' && (
            sortedPlaylists.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="albums-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTxt}>No playlists yet</Text>
                <Text style={styles.emptySub}>Import folders to create playlists</Text>
              </View>
            ) : (
              <View style={styles.plGrid}>
                {sortedPlaylists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} onPress={() => navigation.navigate('Playlist', { playlistId: pl.id })} size={160} />
                ))}
              </View>
            )
          )}

          {activeTab === 'Folders' && (
            sortedPlaylists.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTxt}>No folders imported</Text>
                <TouchableOpacity style={styles.scanBtn} onPress={handleImport}>
                  <Ionicons name="scan" size={16} color={colors.white} />
                  <Text style={styles.scanBtnTxt}>Scan Device</Text>
                </TouchableOpacity>
              </View>
            ) : (
              sortedPlaylists.map((pl) => (
                <View key={pl.id} style={styles.folderRow}>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => navigation.navigate('Playlist', { playlistId: pl.id })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.folderIcon, { backgroundColor: pl.colorA + '33' }]}>
                      <Ionicons name="folder" size={22} color={pl.colorA} />
                    </View>
                    <View style={styles.folderInfo}>
                      <Text style={styles.folderName} numberOfLines={1}>{pl.name}</Text>
                      <Text style={styles.folderMeta}>{pl.trackCount} tracks</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.folderDelete}
                    onPress={() => handleDeleteFolder(pl.id, pl.name)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.red} />
                  </TouchableOpacity>
                </View>
              ))
            )
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.base },
  title: { fontSize: typography.xxl, fontWeight: typography.bold, color: colors.textPrimary },
  headerRight: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { padding: spacing.xs + 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.base, gap: spacing.xs, marginBottom: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  sortBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  sortTxt: { fontSize: typography.sm, color: colors.textSecondary },
  countTxt: { fontSize: typography.sm, color: colors.textMuted },
  dropdown: { position: 'absolute', top: 156, left: spacing.base, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, zIndex: 100, overflow: 'hidden', minWidth: 170 },
  dropItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.sm + 4 },
  dropItemTxt: { fontSize: typography.base, color: colors.textSecondary },
  multiBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, backgroundColor: colors.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  multiCount: { fontSize: typography.sm, color: colors.accentLight, fontWeight: typography.semibold },
  multiActions: { flexDirection: 'row', gap: spacing.base },
  multiAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  multiActionTxt: { fontSize: typography.sm, color: colors.textSecondary },
  listContent: { paddingHorizontal: spacing.base },
  selectableRow: { flexDirection: 'row', alignItems: 'center' },
  selectedRow: { backgroundColor: colors.accentGlow, borderRadius: radius.md },
  checkBtn: { paddingRight: spacing.sm },
  checkbox: { width: 20, height: 20, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  plGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyTxt: { fontSize: typography.md, color: colors.textMuted },
  emptySub: { fontSize: typography.sm, color: colors.textMuted, textAlign: 'center' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.accent, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 2, marginTop: spacing.sm },
  scanBtnTxt: { fontSize: typography.sm, fontWeight: typography.bold, color: colors.white },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  folderIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  folderInfo: { flex: 1 },
  folderName: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  folderMeta: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  folderDelete: { padding: spacing.sm },
});
