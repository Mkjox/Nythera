import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';

const DEVICES = [
  { id: 'd1', name: 'AirPods Pro', type: 'bluetooth', connected: true, battery: 82 },
  { id: 'd2', name: 'Sony WH-1000XM5', type: 'bluetooth', connected: false, battery: 55 },
  { id: 'd3', name: 'Samsung Galaxy Buds', type: 'bluetooth', connected: false, battery: 30 },
  { id: 'd4', name: 'Living Room Chromecast', type: 'cast', connected: false, battery: null },
  { id: 'd5', name: 'Bedroom Speaker', type: 'cast', connected: false, battery: null },
];

export default function OutputScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState('phone');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Audio Output</Text>
        <TouchableOpacity style={styles.scanBtn}>
          <Ionicons name="refresh" size={18} color={colors.accentLight} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Phone speaker */}
        <Text style={styles.sectionLabel}>THIS DEVICE</Text>
        <TouchableOpacity style={[styles.deviceCard, selected === 'phone' && styles.deviceCardActive]} onPress={() => setSelected('phone')}>
          <View style={[styles.deviceIcon, selected === 'phone' && styles.deviceIconActive]}>
            <Ionicons name="phone-portrait-outline" size={22} color={selected === 'phone' ? colors.white : colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceName}>Phone Speaker</Text>
            <Text style={styles.deviceSub}>Internal audio output</Text>
          </View>
          {selected === 'phone' && (
            <View style={styles.activeBadge}>
              <Ionicons name="volume-high" size={14} color={colors.accentLight} />
              <Text style={styles.activeTxt}>Active</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Bluetooth */}
        <Text style={styles.sectionLabel}>BLUETOOTH</Text>
        {DEVICES.filter((d) => d.type === 'bluetooth').map((d) => (
          <TouchableOpacity key={d.id} style={[styles.deviceCard, selected === d.id && styles.deviceCardActive]} onPress={() => setSelected(d.id)}>
            <View style={[styles.deviceIcon, selected === d.id && styles.deviceIconActive]}>
              <Ionicons name="bluetooth" size={22} color={selected === d.id ? colors.white : colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{d.name}</Text>
              <Text style={styles.deviceSub}>{d.connected ? 'Connected' : 'Available'}</Text>
            </View>
            <View style={styles.deviceRight}>
              {d.battery !== null && (
                <View style={styles.batteryRow}>
                  <Ionicons name="battery-half" size={14} color={d.battery > 50 ? colors.green : colors.yellow} />
                  <Text style={styles.batteryTxt}>{d.battery}%</Text>
                </View>
              )}
              {selected === d.id && <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Cast */}
        <Text style={styles.sectionLabel}>CAST TO DEVICE</Text>
        {DEVICES.filter((d) => d.type === 'cast').map((d) => (
          <TouchableOpacity key={d.id} style={[styles.deviceCard, selected === d.id && styles.deviceCardActive]} onPress={() => setSelected(d.id)}>
            <View style={[styles.deviceIcon, selected === d.id && styles.deviceIconActive]}>
              <Ionicons name="tv-outline" size={22} color={selected === d.id ? colors.white : colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{d.name}</Text>
              <Text style={styles.deviceSub}>Google Cast</Text>
            </View>
            {selected === d.id && <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} />}
          </TouchableOpacity>
        ))}

        {/* Now casting info */}
        {selected !== 'phone' && (
          <View style={styles.castingCard}>
            <Ionicons name="musical-notes" size={18} color={colors.accentLight} />
            <View style={{ flex: 1 }}>
              <Text style={styles.castingTxt}>Casting: Neon Drift</Text>
              <Text style={styles.castingTo}>To {DEVICES.find((d) => d.id === selected)?.name ?? selected}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelected('phone')}>
              <Text style={styles.stopCast}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  backBtn: { marginRight: spacing.sm },
  title: { flex: 1, fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  scanBtn: { padding: spacing.xs + 2 },
  content: { paddingHorizontal: spacing.base },
  sectionLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  deviceCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.md, marginBottom: spacing.sm },
  deviceCardActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  deviceIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.cardAlt, alignItems: 'center', justifyContent: 'center' },
  deviceIconActive: { backgroundColor: colors.accent },
  deviceName: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textPrimary },
  deviceSub: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  deviceRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  batteryRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  batteryTxt: { fontSize: typography.xs, color: colors.textMuted },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentGlow, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  activeTxt: { fontSize: typography.xs, color: colors.accentLight, fontWeight: typography.semibold },
  castingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.accent, borderRadius: radius.xl, padding: spacing.md, marginTop: spacing.md },
  castingTxt: { fontSize: typography.base, fontWeight: typography.medium, color: colors.textPrimary },
  castingTo: { fontSize: typography.sm, color: colors.textSecondary, marginTop: 2 },
  stopCast: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.red },
});
