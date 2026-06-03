import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary } from '../store/MusicProvider';
import { rescanFolder, requestMediaPermission } from '../services/scanService';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AlbumPickerModal({ visible, onClose }: Props) {
  const { playlists, dispatch } = useLibrary();
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const perm = await requestMediaPermission();
      if (!perm) {
        Alert.alert('Permission required', 'App needs access to your media to import folders.');
        onClose();
        return;
      }
      try {
        const a = await MediaLibrary.getAlbumsAsync();
        setAlbums(a);
      } catch (e) {
        console.warn('Failed to load albums', e);
        setAlbums([]);
      }
    })();
  }, [visible, onClose]);

  const toggle = useCallback((id: string) => {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }, []);

  const importSelected = useCallback(async () => {
    const ids = Object.keys(selected).filter(k => selected[k]);
    if (ids.length === 0) return Alert.alert('No folders selected', 'Please select at least one folder to import.');
    setLoading(true);
    try {
      let colorIdx = playlists.length % 8;
      for (const albumId of ids) {
        const album = albums.find(a => a.id === albumId);
        const tracks = await rescanFolder(albumId);
        if (tracks.length === 0) continue;
        const pl = {
          id: 'pl_' + albumId,
          name: album?.title || albumId,
          trackCount: tracks.length,
          colorA: ['#7C3AED', '#EC4899', '#F97316', '#06B6D4', '#F59E0B', '#5B21B6', '#22C55E', '#3B82F6'][colorIdx % 8],
          colorB: ['#3B82F6', '#7C3AED', '#EF4444', '#3B82F6', '#F97316', '#EC4899', '#06B6D4', '#22C55E'][colorIdx % 8],
          folderUri: albumId,
          trackIds: tracks.map(t => t.id),
        } as any;
        dispatch({ type: 'ADD_PLAYLIST', playlist: pl, tracks });
        colorIdx++;
      }
      onClose();
    } catch (e) {
      console.warn('Import failed', e);
      Alert.alert('Import failed', 'Unable to import selected folders.');
    } finally {
      setLoading(false);
    }
  }, [selected, albums, dispatch, playlists.length, onClose]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Import Folders</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {albums.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator />
            <Text style={styles.emptyTxt}>No folders found</Text>
          </View>
        ) : (
          <FlatList
            data={albums}
            keyExtractor={(it) => it.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => toggle(item.id)}>
                <View style={styles.rowLeft}>
                  <Ionicons name="folder" size={20} color={colors.accentLight} />
                  <View style={{ marginLeft: spacing.sm }}>
                    <Text style={styles.rowTitle}>{item.title || item.id}</Text>
                    <Text style={styles.rowMeta}>{item.assetCount} tracks</Text>
                  </View>
                </View>
                <View>
                  {selected[item.id] ? <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} /> : <Ionicons name="ellipse-outline" size={18} color={colors.textMuted} />}
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.importBtn, { opacity: selected && Object.values(selected).some(Boolean) ? 1 : 0.5 }]} onPress={importSelected} disabled={loading || !Object.values(selected).some(Boolean)}>
            {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.importTxt}>Import Selected</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, borderBottomWidth: 1, borderColor: colors.border },
  title: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  closeBtn: { padding: spacing.xs },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyTxt: { color: colors.textMuted, marginTop: spacing.sm },
  list: { padding: spacing.base },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontSize: typography.base, color: colors.textPrimary },
  rowMeta: { fontSize: typography.xs, color: colors.textMuted },
  actions: { padding: spacing.base, borderTopWidth: 1, borderColor: colors.border },
  importBtn: { backgroundColor: colors.accent, padding: spacing.md, borderRadius: radius.full, alignItems: 'center' },
  importTxt: { color: colors.white, fontWeight: typography.bold },
});
