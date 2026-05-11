import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';

const DURATIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: 'End of track', value: -1 },
];

const END_ACTIONS = [
  { label: 'Pause playback', icon: 'pause-circle-outline' },
  { label: 'Stop playback', icon: 'stop-circle-outline' },
  { label: 'Finish current track', icon: 'musical-note-outline' },
];

export default function SleepTimerScreen() {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<number | null>(null);
  const [endAction, setEndAction] = useState('Pause playback');
  const [active, setActive] = useState(false);
  const remaining = selected !== null ? selected : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Sleep Timer</Text>
      </View>

      {/* Clock face */}
      <View style={styles.clockWrap}>
        <View style={styles.clockOuter}>
          <View style={styles.clockInner}>
            <Ionicons name="moon" size={36} color={active ? colors.accentLight : colors.textMuted} />
            {active && selected !== null && (
              <Text style={styles.clockTime}>{selected} min</Text>
            )}
            {!active && (
              <Text style={styles.clockOff}>OFF</Text>
            )}
          </View>
        </View>
        {active && selected !== null && (
          <Text style={styles.clockSub}>Music stops in {selected} min</Text>
        )}
      </View>

      {/* Duration grid */}
      <Text style={styles.sectionLabel}>SET TIMER</Text>
      <View style={styles.grid}>
        {DURATIONS.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.durationBtn, selected === d.value && styles.durationBtnActive]}
            onPress={() => setSelected(d.value)}
          >
            <Text style={[styles.durationTxt, selected === d.value && styles.durationTxtActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* End action */}
      <Text style={styles.sectionLabel}>WHEN TIMER ENDS</Text>
      <View style={styles.actionsCard}>
        {END_ACTIONS.map((a, i) => (
          <View key={a.label}>
            <TouchableOpacity style={styles.actionRow} onPress={() => setEndAction(a.label)}>
              <Ionicons name={a.icon as any} size={20} color={endAction === a.label ? colors.accentLight : colors.textSecondary} />
              <Text style={[styles.actionTxt, endAction === a.label && styles.actionTxtActive]}>{a.label}</Text>
              <View style={[styles.radio, endAction === a.label && styles.radioActive]}>
                {endAction === a.label && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
            {i < END_ACTIONS.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>

      {/* Start / cancel button */}
      <View style={styles.btnWrap}>
        {active ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setActive(false); setSelected(null); }}>
            <Ionicons name="stop-circle-outline" size={20} color={colors.red} />
            <Text style={styles.cancelTxt}>Cancel Timer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.startBtn, !selected && styles.startBtnDisabled]}
            onPress={() => selected && setActive(true)}
            disabled={!selected}
          >
            <Ionicons name="moon" size={18} color={colors.white} />
            <Text style={styles.startTxt}>Start Timer</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  backBtn: { marginRight: spacing.sm },
  title: { fontSize: typography.xl, fontWeight: typography.bold, color: colors.textPrimary },
  clockWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  clockOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  clockInner: { alignItems: 'center', gap: spacing.xs },
  clockTime: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.accentLight },
  clockOff: { fontSize: typography.sm, color: colors.textMuted, fontWeight: typography.bold, letterSpacing: 2 },
  clockSub: { fontSize: typography.sm, color: colors.textSecondary, marginTop: spacing.sm },
  sectionLabel: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, paddingHorizontal: spacing.base, marginBottom: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.base, marginBottom: spacing.xl },
  durationBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  durationBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  durationTxt: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  durationTxtActive: { color: colors.white },
  actionsCard: { marginHorizontal: spacing.base, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.base },
  actionTxt: { flex: 1, fontSize: typography.base, color: colors.textSecondary },
  actionTxtActive: { color: colors.textPrimary, fontWeight: typography.medium },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  divider: { height: 1, backgroundColor: colors.borderSubtle, marginLeft: spacing.base + 20 + spacing.md },
  btnWrap: { paddingHorizontal: spacing.base },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.accent, borderRadius: radius.xl, paddingVertical: spacing.md, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnDisabled: { backgroundColor: colors.card, shadowOpacity: 0 },
  startTxt: { fontSize: typography.base, fontWeight: typography.bold, color: colors.white },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.red, borderRadius: radius.xl, paddingVertical: spacing.md },
  cancelTxt: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.red },
});
