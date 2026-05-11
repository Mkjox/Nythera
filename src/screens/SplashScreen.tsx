import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ring2, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    }, 600);
  }, []);

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.9, 2.2] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.5, 0.3, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 2.2] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 0.2, 0] });

  return (
    <View style={styles.container}>
      {/* Background dots */}
      <View style={styles.dotGrid} pointerEvents="none">
        {Array.from({ length: 120 }).map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>

      {/* Pulse rings */}
      <Animated.View style={[styles.ring, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
      <Animated.View style={[styles.ring, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="musical-notes" size={52} color={colors.white} />
        </View>
        <Text style={styles.appName}>NYTHERA</Text>
        <Text style={styles.tagline}>Your music, elevated.</Text>
      </Animated.View>

      {/* Permission card */}
      <Animated.View style={[styles.card, { opacity }]}>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.accentLight} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Storage & Audio Access</Text>
          <Text style={styles.cardSub}>Required to play your local music library</Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.btnGroup, { opacity }]}>
        <View style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>Allow & Continue</Text>
        </View>
        <Text style={styles.skip}>Skip for now</Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={styles.loadingTrack}>
        <Animated.View style={[styles.loadingFill, { width: '72%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dotGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.base,
    gap: 28,
    opacity: 0.07,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 16,
  },
  appName: {
    fontSize: typography.xxl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  btnGroup: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    paddingVertical: spacing.base,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  skip: {
    fontSize: typography.sm,
    color: colors.textMuted,
    paddingVertical: spacing.xs,
  },
  loadingTrack: {
    position: 'absolute',
    bottom: 48,
    left: spacing.xxxl,
    right: spacing.xxxl,
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  loadingFill: {
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
});
