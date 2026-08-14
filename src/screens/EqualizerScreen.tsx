import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import * as audioService from '../services/audioService';

const PRESETS = ['Flat', 'Bass Boost', 'Treble', 'Vocal', 'Rock', 'Pop', 'Jazz', 'Classical', 'Custom'];
const BANDS = ['60Hz', '150Hz', '400Hz', '1kHz', '2.5k', '6kHz', '16k'];
const DEFAULT_GAINS = [0, 3, -2, 0, 2, 4, 1];

const PRESET_GAINS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 1, 0, 0, 0, 0],
  'Treble': [0, 0, 0, 0, 2, 4, 6],
  'Vocal': [-2, -1, 0, 4, 3, 1, -1],
  'Rock': [5, 3, -1, 1, 3, 4, 5],
  'Pop': [-1, 2, 4, 4, 2, -1, -2],
  'Jazz': [3, 2, -2, 2, -1, 2, 3],
  'Classical': [4, 3, -3, 2, 1, 3, 4],
  'Custom': DEFAULT_GAINS,
};

export default function EqualizerScreen() {
  const navigation = useNavigation<any>();
  const [enabled, setEnabled] = useState(true);
  const [preset, setPreset] = useState('Custom');
  const [gains, setGains] = useState(DEFAULT_GAINS);
  const [bassBoost, setBassBoost] = useState(40);

  const adjustGain = (i: number, delta: number) => {
    setGains((g) => g.map((v, idx) => idx === i ? Math.max(-12, Math.min(12, v + delta)) : v));
    setPreset('Custom');
  };

  const handlePresetSelect = (p: string) => {
    setPreset(p);
    if (PRESET_GAINS[p]) {
      setGains(PRESET_GAINS[p]);
    }
  };

  // Apply changes to native audio service
  React.useEffect(() => {
    audioService.setEqualizerEnabled(enabled);
  }, [enabled]);

  React.useEffect(() => {
    // apply each band
    gains.forEach((g, i) => {
      audioService.setEqualizerBand(i, g).catch(() => {});
    });
  }, [gains]);

  React.useEffect(() => {
    audioService.setBassBoost(bassBoost).catch(() => {});
  }, [bassBoost]);

  React.useEffect(() => {
    if (preset !== 'Custom') {
      const p = PRESET_GAINS[preset] ?? DEFAULT_GAINS;
      audioService.setEqualizerPreset(p).catch(() => {});
    }
  }, [preset]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Equalizer</Text>
        <TouchableOpacity style={[styles.pill, enabled && styles.pillOn]} onPress={() => setEnabled(!enabled)}>
          <Text style={[styles.pillTxt, enabled && styles.pillTxtOn]}>{enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.label}>PRESETS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity key={p} style={[styles.presetBtn, preset === p && styles.presetActive]} onPress={() => handlePresetSelect(p)}>
              <Text style={[styles.presetTxt, preset === p && styles.presetTxtActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>EQ BANDS</Text>
        <View style={styles.eqCard}>
          <View style={styles.bands}>
            {BANDS.map((band, i) => {
              const gain = gains[i];
              const barH = (Math.abs(gain) / 12) * 50;
              return (
                <View key={band} style={styles.band}>
                  <TouchableOpacity onPress={() => adjustGain(i, 1)} style={styles.arrow} disabled={!enabled}>
                    <Ionicons name="chevron-up" size={13} color={enabled ? colors.textSecondary : colors.textMuted} />
                  </TouchableOpacity>
                  <Text style={[styles.gainTxt, { color: gain >= 0 ? colors.accentLight : colors.pink }]}>{gain > 0 ? '+' : ''}{gain}</Text>
                  <View style={styles.barWrap}>
                    {gain >= 0 ? (
                      <View style={[styles.barPos, { height: barH, opacity: enabled ? 1 : 0.3 }]} />
                    ) : (
                      <View style={[styles.barNeg, { height: barH, opacity: enabled ? 1 : 0.3 }]} />
                    )}
                    <View style={styles.barCenter} />
                  </View>
                  <TouchableOpacity onPress={() => adjustGain(i, -1)} style={styles.arrow} disabled={!enabled}>
                    <Ionicons name="chevron-down" size={13} color={enabled ? colors.textSecondary : colors.textMuted} />
                  </TouchableOpacity>
                  <Text style={styles.bandTxt}>{band}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.label}>BASS BOOST</Text>
        <View style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLbl}>Intensity</Text>
            <Text style={styles.sliderVal}>{bassBoost}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${bassBoost}%`, opacity: enabled ? 1 : 0.3 }]} />
            <View style={[styles.thumb, { left: `${bassBoost}%`, opacity: enabled ? 1 : 0.3 }]} />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.resetBtn} onPress={() => handlePresetSelect('Flat')}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            <Text style={styles.resetTxt}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Ionicons name="save-outline" size={16} color={colors.white} />
            <Text style={styles.saveTxt}>Save Preset</Text>
          </TouchableOpacity>
        </View>

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
  pill: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 5 },
  pillOn: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  pillTxt: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1 },
  pillTxtOn: { color: colors.accentLight },
  content: { paddingHorizontal: spacing.base },
  label: { fontSize: typography.xs, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.sm },
  presetRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  presetBtn: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  presetActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  presetTxt: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: typography.medium },
  presetTxtActive: { color: colors.white },
  eqCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.base },
  bands: { flexDirection: 'row', justifyContent: 'space-around' },
  band: { alignItems: 'center', gap: 3 },
  arrow: { padding: 2 },
  gainTxt: { fontSize: 9, fontWeight: typography.bold },
  barWrap: { height: 80, alignItems: 'center', justifyContent: 'center', position: 'relative', width: 12 },
  barPos: { width: 10, borderRadius: 3, backgroundColor: colors.accent, position: 'absolute', bottom: '50%' },
  barNeg: { width: 10, borderRadius: 3, backgroundColor: colors.pink, position: 'absolute', top: '50%' },
  barCenter: { position: 'absolute', width: 12, height: 1, backgroundColor: colors.border },
  bandTxt: { fontSize: 8, color: colors.textMuted, textAlign: 'center' },
  sliderCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.base },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  sliderLbl: { fontSize: typography.base, color: colors.textSecondary },
  sliderVal: { fontSize: typography.base, fontWeight: typography.bold, color: colors.accentLight },
  track: { height: 4, backgroundColor: colors.border, borderRadius: 2, position: 'relative' },
  fill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  thumb: { position: 'absolute', top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, marginLeft: -8 },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, paddingVertical: spacing.md },
  resetTxt: { fontSize: typography.sm, color: colors.textSecondary },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.accent, borderRadius: radius.xl, paddingVertical: spacing.md },
  saveTxt: { fontSize: typography.sm, fontWeight: typography.semibold, color: colors.white },
});
