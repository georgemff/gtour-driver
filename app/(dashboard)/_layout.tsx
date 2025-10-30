import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs } from 'expo-router';
import React from 'react';
import {Ionicons} from "@expo/vector-icons";

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'შეკვეთები',
          tabBarIcon: ({ color }) => <Ionicons size={20} name="home-sharp" color={color} />,
        }}
      />
        <Tabs.Screen
            name="history"
            options={{
                title: 'ისტორია',
                tabBarIcon: ({ color }) => <Ionicons size={20} name="list-sharp" color={color} />,
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: 'პროფილი',
                tabBarIcon: ({ color }) => <Ionicons size={20} name="person-sharp" color={color} />,
            }}
        />
    </Tabs>
  );
}
