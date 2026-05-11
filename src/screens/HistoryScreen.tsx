import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { HISTORY } from '../data/mockData';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity style={styles.clearBtn}>
          <Text style={styles.clearTxt}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={HISTORY}
        keyExtractor={(item, i) => item.id + i}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('NowPlaying')} activeOpacity={0.7}>
            <View style={styles.artBox}>
              <Ionicons name="musical-note" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.info}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{item.artist} • {item.album}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.playedAt}>{item.playedAt}</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTxt}>No listening history yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  backBtn: { marginRight: spacing.sm },
  title: { flex: 1, fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  clearBtn: { padding: spacing.xs + 2 },
  clearTxt: { fontSize: typography.sm, color: colors.red, fontWeight: typography.medium },
  list: { paddingHorizontal: spacing.base, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 2 },
  artBox: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  trackTitle: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  trackArtist: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  playedAt: { fontSize: typography.xs, color: colors.textMuted },
  addBtn: {},
  sep: { height: 1, backgroundColor: colors.borderSubtle },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: spacing.md },
  emptyTxt: { fontSize: typography.md, color: colors.textMuted },
});
