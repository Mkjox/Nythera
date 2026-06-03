import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import PlaylistScreen from '../screens/PlaylistScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EqualizerScreen from '../screens/EqualizerScreen';
import SleepTimerScreen from '../screens/SleepTimerScreen';
import OutputScreen from '../screens/OutputScreen';
import QueueScreen from '../screens/QueueScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom tab shell — MiniPlayer lives here */}
      <Stack.Screen name="Main">
        {() => <TabNavigator onMiniPlayerPress={() => {}} />}
      </Stack.Screen>

      {/* Full-screen modal screens */}
      <Stack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
      />

      {/* Playlist detail */}
      <Stack.Screen
        name="Playlist"
        component={PlaylistScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* History */}
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ animation: 'slide_from_right' }}
      />

      {/* Settings stack */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Equalizer"
        component={EqualizerScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SleepTimer"
        component={SleepTimerScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Output"
        component={OutputScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Queue"
        component={QueueScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Downloads"
        component={DownloadsScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
