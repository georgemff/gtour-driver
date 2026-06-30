import { useUser } from '@/hooks/use-user';
import {
  registerDriverPushToken,
  unregisterDriverPushToken,
} from '@/services/driver-app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const PUSH_TOKEN_STORAGE_KEY = 'driver_push_token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useDriverPushNotifications() {
  const { isAuth } = useUser();

  useEffect(() => {
    if (!isAuth) {
      removeStoredPushToken();
      return;
    }

    registerForPushNotifications();
  }, [isAuth]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const bookingId = response.notification.request.content.data?.bookingId;

      if (typeof bookingId === 'number' || typeof bookingId === 'string') {
        router.push(`/booking/${bookingId}` as never);
      }
    });

    return () => subscription.remove();
  }, []);
}

async function registerForPushNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const existingPermissions = await Notifications.getPermissionsAsync();
    const finalPermissions = existingPermissions.granted
      ? existingPermissions
      : await Notifications.requestPermissionsAsync();

    if (!finalPermissions.granted) {
      return;
    }

    const projectId =
      process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error('Missing Expo projectId. Set EXPO_PUBLIC_EAS_PROJECT_ID.');
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    const storedToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

    if (storedToken !== token) {
      await registerDriverPushToken(token, Platform.OS);
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    }
  } catch (error) {
    console.log('Push notification registration failed', error);
  }
}

async function removeStoredPushToken() {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);

  if (!token) {
    return;
  }

  try {
    await unregisterDriverPushToken(token);
  } catch (error) {
    console.log('Push notification unregister failed', error);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  }
}
