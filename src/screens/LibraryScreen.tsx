import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { TRACKS, PLAYLISTS } from '../data/mockData';
import TrackItem from '../components/TrackItem';
import PlaylistCard from '../components/PlaylistCard';
import SectionHeader from '../components/SectionHeader';

const TABS = ['Songs', 'Playlists', 'Downloads'];
const SORTS = ['Title', 'Artist', 'Date Added', 'Duration'];

export default function LibraryScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Songs');
  const [activeSort, setActiveSort] = useState('Title');
  const [sortOpen, setSortOpen] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => { setMultiSelect(!multiSelect); setSelected([]); }}>
            <Ionicons name={multiSelect ? 'checkmark-done' : 'checkbox-outline'} size={22} color={multiSelect ? colors.accentLight : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="add" size={24} color={colors.textSecondary} />
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
      <View style={styles.sortBar}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(!sortOpen)}>
          <Ionicons name="filter" size={15} color={colors.textSecondary} />
          <Text style={styles.sortTxt}>{activeSort}</Text>
          <Ionicons name={sortOpen ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.countTxt}>{activeTab === 'Songs' ? TRACKS.length : PLAYLISTS.length} items</Text>
      </View>

      {/* Sort dropdown */}
      {sortOpen && (
        <View style={styles.dropdown}>
          {SORTS.map((s) => (
            <TouchableOpacity key={s} style={styles.dropItem} onPress={() => { setActiveSort(s); setSortOpen(false); }}>
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
            <TouchableOpacity style={styles.multiAction}><Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} /><Text style={styles.multiActionTxt}>Add to</Text></TouchableOpacity>
            <TouchableOpacity style={styles.multiAction}><Ionicons name="download-outline" size={20} color={colors.textSecondary} /><Text style={styles.multiActionTxt}>Download</Text></TouchableOpacity>
            <TouchableOpacity style={styles.multiAction}><Ionicons name="trash-outline" size={20} color={colors.red} /><Text style={[styles.multiActionTxt, { color: colors.red }]}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {activeTab === 'Songs' && TRACKS.map((t) => (
          <View key={t.id} style={[styles.selectableRow, multiSelect && selected.includes(t.id) && styles.selectedRow]}>
            {multiSelect && (
              <TouchableOpacity onPress={() => toggleSelect(t.id)} style={styles.checkBtn}>
                <View style={[styles.checkbox, selected.includes(t.id) && styles.checkboxChecked]}>
                  {selected.includes(t.id) && <Ionicons name="checkmark" size={12} color={colors.white} />}
                </View>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <TrackItem track={t} onPress={() => navigation.navigate('NowPlaying')} />
            </View>
          </View>
        ))}

        {activeTab === 'Playlists' && (
          <>
            <View style={styles.plGrid}>
              {PLAYLISTS.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} onPress={() => navigation.navigate('Playlist', { playlist: pl })} size={160} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'Downloads' && (
          <>
            <View style={styles.storageCard}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.accentLight} />
              <View style={{ flex: 1 }}>
                <Text style={styles.storageTxt}>Storage Used</Text>
                <View style={styles.storageBar}><View style={[styles.storageFill, { width: '34%' }]} /></View>
              </View>
              <Text style={styles.storageNum}>1.2 GB / 3.5 GB</Text>
            </View>
            {TRACKS.filter((t) => t.isDownloaded).map((t) => (
              <TrackItem key={t.id} track={t} onPress={() => navigation.navigate('NowPlaying')} />
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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
  storageCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.lg },
  storageTxt: { fontSize: typography.sm, color: colors.textSecondary, marginBottom: 6 },
  storageBar: { height: 4, backgroundColor: colors.border, borderRadius: 2 },
  storageFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  storageNum: { fontSize: typography.xs, color: colors.textMuted },
});
