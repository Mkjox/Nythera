import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { MusicProvider } from './src/store/MusicProvider';
import { colors } from './src/theme';

export default function App() {
  return (
    <MusicProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <View style={styles.root}>
            <StatusBar style="light" backgroundColor={colors.bg} />
            <AppNavigator />
          </View>
        </NavigationContainer>
      </SafeAreaProvider>
    </MusicProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
