import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, PermissionsAndroid, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme';
import { useMusicStore } from '../store/MusicProvider';

// NOTE: real audio routing requires native support (AVRoutePicker/AudioManager/Cast SDKs).
// This screen will attempt a BLE scan via `react-native-ble-plx` when available; otherwise
// it provides a quick link to system Bluetooth settings as a fallback.

export default function OutputScreen() {
  const navigation = useNavigation<any>();
  const { state, setOutputDevice } = useMusicStore();
  const selected = state.outputDevice ?? 'phone';

  const [devices, setDevices] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [scanning, setScanning] = useState(false);
  const [bleAvailable, setBleAvailable] = useState<boolean | null>(null);

  const openBluetoothSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') await Linking.openURL('App-Prefs:Bluetooth');
      else await Linking.openSettings();
    } catch (e) {
      Linking.openSettings().catch(() => {});
    }
  }, []);

  const scanForBluetooth = useCallback(async () => {
    setDevices([]);
    setScanning(true);
    // Request permissions on Android
    if (Platform.OS === 'android') {
      try {
        const perms: any = {};
        // Request newer BLUETOOTH permissions (no location permission requested)
        const toRequest = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ].filter(Boolean);
        const res = await PermissionsAndroid.requestMultiple(toRequest as any);
        const denied = Object.values(res).some(v => v !== PermissionsAndroid.RESULTS.GRANTED);
        if (denied) {
          setScanning(false);
          Alert.alert('Permission required', 'Bluetooth permission is required to scan for nearby devices. Please enable it in settings.');
          return;
        }
      } catch (e) {
        console.warn('Permission request failed', e);
      }
    }
    try {
      const BlePlx = require('react-native-ble-plx');
      const BleManager = BlePlx?.BleManager || BlePlx?.default || BlePlx;
      // @ts-ignore
      const manager = new BleManager();
      setBleAvailable(true);
      const found = new Map<string, { id: string; name: string; type: string }>();
      // @ts-ignore
      manager.startDeviceScan(null, null, (error: any, device: any) => {
        if (error) {
          console.warn('BLE scan error', error);
          return;
        }
        if (device && device.id) {
          const name = device.name || device.localName || `Device ${device.id.slice(0, 6)}`;
          if (!found.has(device.id)) {
            found.set(device.id, { id: device.id, name, type: 'bluetooth' });
            setDevices(Array.from(found.values()));
          }
        }
      });
      setTimeout(() => {
        try {
          // @ts-ignore
          manager.stopDeviceScan();
        } catch (e) {}
        setScanning(false);
      }, 4000);
    } catch (e) {
      // Avoid raising a yellow-box in dev when optional BLE library is missing.
      console.info('BLE library not available');
      setBleAvailable(false);
      setScanning(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Audio Output</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={() => scanForBluetooth()}>
          <Ionicons name={scanning ? 'refresh' : 'refresh'} size={18} color={colors.accentLight} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Phone speaker */}
        <Text style={styles.sectionLabel}>THIS DEVICE</Text>
        <TouchableOpacity style={[styles.deviceCard, selected === 'phone' && styles.deviceCardActive]} onPress={() => setOutputDevice('phone')}>
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
        {bleAvailable === false && (
          <View style={{ paddingVertical: 12 }}>
            <Text style={{ color: colors.textMuted }}>Bluetooth integration not available. Install a BLE library or enable Bluetooth.</Text>
            <TouchableOpacity style={{ marginTop: 8 }} onPress={openBluetoothSettings}>
              <Text style={{ color: colors.accentLight }}>Open Bluetooth Settings</Text>
            </TouchableOpacity>
          </View>
        )}
        {bleAvailable === null && (
          <View style={{ paddingVertical: 8 }}>
            <Text style={{ color: colors.textMuted }}>Press refresh to scan for nearby Bluetooth devices.</Text>
          </View>
        )}
        {devices.map((d) => (
          <TouchableOpacity key={d.id} style={[styles.deviceCard, selected === d.id && styles.deviceCardActive]} onPress={() => setOutputDevice(d.id)}>
            <View style={[styles.deviceIcon, selected === d.id && styles.deviceIconActive]}>
              <Ionicons name="bluetooth" size={22} color={selected === d.id ? colors.white : colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{d.name}</Text>
              <Text style={styles.deviceSub}>Available</Text>
            </View>
            {selected === d.id && <Ionicons name="checkmark-circle" size={20} color={colors.accentLight} />}
          </TouchableOpacity>
        ))}

        {/* Cast */}
        <Text style={styles.sectionLabel}>CAST TO DEVICE</Text>
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ color: colors.textMuted }}>Casting support requires additional libraries (Google Cast/AirPlay). Install and integrate a cast SDK to list cast targets here.</Text>
        </View>

        {/* Now casting info */}
        {selected !== 'phone' && (
          <View style={styles.castingCard}>
            <Ionicons name="musical-notes" size={18} color={colors.accentLight} />
            <View style={{ flex: 1 }}>
              <Text style={styles.castingTxt}>Casting: Neon Drift</Text>
              <Text style={styles.castingTo}>To {devices.find((d) => d.id === selected)?.name ?? selected}</Text>
            </View>
            <TouchableOpacity onPress={() => setOutputDevice('phone')}>
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
