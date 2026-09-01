import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/hooks/use-user';
import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, router } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const pathname = usePathname();
  const [promptedDriverId, setPromptedDriverId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.isFirstLogin && user?.id !== promptedDriverId && pathname !== '/change-password') {
      setPromptedDriverId(user.id);
      router.push('/change-password?required=1' as never);
    }
  }, [pathname, promptedDriverId, user?.id, user?.isFirstLogin]);

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
            name="availability"
            options={{
                title: 'შვებულება',
                tabBarIcon: ({ color }) => <Ionicons size={20} name="calendar-sharp" color={color} />,
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                title: 'პროფილი',
                tabBarIcon: ({ color }) => <Ionicons size={20} name="person-sharp" color={color} />,
            }}
        />
        <Tabs.Screen
            name="booking/[id]"
            options={{
                href: null,
            }}
        />
        <Tabs.Screen
            name="change-password"
            options={{
                href: null,
            }}
        />
    </Tabs>
  );
}
