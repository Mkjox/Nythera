import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useLibrary } from '../store/MusicProvider';
import { scanAudioFiles, requestMediaPermission } from '../services/scanService';

type ToggleRowProps = { label: string; sub?: string; value: boolean; onToggle: () => void };
const ToggleRow = ({ label, sub, value, onToggle }: ToggleRowProps) => (
  <TouchableOpacity style={styles.toggleRow} onPress={onToggle} activeOpacity={0.7}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {sub && <Text style={styles.toggleSub}>{sub}</Text>}
    </View>
    <View style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </View>
  </TouchableOpacity>
);

type NavRowProps = { icon: string; label: string; value?: string; onPress: () => void; danger?: boolean };
const NavRow = ({ icon, label, value, onPress, danger }: NavRowProps) => (
  <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.navIcon, danger && { backgroundColor: colors.red + '22' }]}>
      <Ionicons name={icon as any} size={18} color={danger ? colors.red : colors.accentLight} />
    </View>
    <Text style={[styles.navLabel, danger && { color: colors.red }]}>{label}</Text>
    <View style={styles.navRight}>
      {value && <Text style={styles.navValue}>{value}</Text>}
      {!danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { hasPermission, dispatch } = useLibrary();
  const [crossfade, setCrossfade] = useState(true);
  const [gapless, setGapless] = useState(false);
  const [normalize, setNormalize] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleScanLibrary = useCallback(async () => {
    let perm = hasPermission;
    if (!perm) {
      perm = await requestMediaPermission();
      dispatch({ type: 'SET_PERMISSION', value: perm });
    }
    if (!perm) return;
    dispatch({ type: 'SET_SCANNING', value: true });
    try {
      const { tracks, playlists } = await scanAudioFiles();
      const map: Record<string, any> = {};
      for (const t of tracks) map[t.id] = t;
      dispatch({ type: 'SET_LIBRARY', tracks: map, playlists });
    } catch (e) { console.warn(e); }
    dispatch({ type: 'SET_SCANNING', value: false });
  }, [hasPermission, dispatch]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Playback */}
        <Text style={styles.section}>PLAYBACK</Text>
        <View style={styles.card}>
          <ToggleRow label="Crossfade" sub="Smooth transition between tracks" value={crossfade} onToggle={() => setCrossfade(!crossfade)} />
          <View style={styles.divider} />
          <ToggleRow label="Gapless Playback" sub="No silence between tracks" value={gapless} onToggle={() => setGapless(!gapless)} />
          <View style={styles.divider} />
          <ToggleRow label="Volume Normalization" sub="Equalise loudness between tracks" value={normalize} onToggle={() => setNormalize(!normalize)} />
          <View style={styles.divider} />
          <ToggleRow label="Autoplay" sub="Continue playing similar music" value={autoplay} onToggle={() => setAutoplay(!autoplay)} />
          <View style={styles.divider} />
          <NavRow icon="speedometer-outline" label="Playback Speed" value="1×" onPress={() => {}} />
          <View style={styles.divider} />
          <NavRow icon="options-outline" label="Equalizer" onPress={() => navigation.navigate('Equalizer')} />
        </View>

        {/* Library */}
        <Text style={styles.section}>LIBRARY</Text>
        <View style={styles.card}>
          <NavRow icon="scan-outline" label="Scan Library" onPress={handleScanLibrary} />
          <View style={styles.divider} />
          <NavRow icon="folder-outline" label="Manage Folders" onPress={() => navigation.navigate('Downloads')} />
        </View>

        {/* Sleep Timer */}
        <Text style={styles.section}>SLEEP TIMER</Text>
        <View style={styles.card}>
          <NavRow icon="moon-outline" label="Sleep Timer" value="Off" onPress={() => navigation.navigate('SleepTimer')} />
        </View>

        {/* Notifications */}
        <Text style={styles.section}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <ToggleRow label="Media Notification" sub="Show controls in notification bar" value={notifications} onToggle={() => setNotifications(!notifications)} />
        </View>

        {/* About */}
        <Text style={styles.section}>ABOUT</Text>
        <View style={styles.card}>
          <NavRow icon="information-circle-outline" label="Version" value="1.0.0" onPress={() => {}} />
          <View style={styles.divider} />
          <NavRow icon="shield-checkmark-outline" label="Privacy" value="100% Offline" onPress={() => {}} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.base },
  title: { fontSize: typography.xxl, fontWeight: typography.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.base },
  section: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginLeft: spacing.base + 44 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, gap: spacing.md },
  toggleLabel: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  toggleSub: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: colors.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: colors.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.textMuted },
  toggleThumbOn: { backgroundColor: colors.white, alignSelf: 'flex-end' },
  navRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, gap: spacing.md },
  navIcon: { width: 34, height: 34, borderRadius: radius.md, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  navValue: { fontSize: typography.sm, color: colors.textSecondary },
});
