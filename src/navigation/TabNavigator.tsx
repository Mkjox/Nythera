import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import LibraryScreen from '../screens/LibraryScreen';
import QueueScreen from '../screens/QueueScreen';
import MiniPlayer from '../components/MiniPlayer';

const Tab = createBottomTabNavigator();

type TabIconProps = {
  name: string;
  focused: boolean;
  label: string;
};

function TabIcon({ name, focused, label }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={name as any}
        size={22}
        color={focused ? colors.accentLight : colors.textMuted}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function TabNavigator({ onMiniPlayerPress }: { onMiniPlayerPress: () => void }) {
  return (
    <View style={styles.wrapper}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} label="Search" />,
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'library' : 'library-outline'} focused={focused} label="Library" />,
          }}
        />
        <Tab.Screen
          name="Queue"
          component={QueueScreen}
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} label="Queue" />,
          }}
        />
      </Tab.Navigator>
      <MiniPlayer onPress={onMiniPlayerPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontWeight: typography.medium,
  },
  tabLabelActive: {
    color: colors.accentLight,
  },
  tabDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentLight,
  },
});
