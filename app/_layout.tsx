import { useColorScheme } from '@/hooks/use-color-scheme';
import AppStack from '@/stack/AppStack';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import UserProvider from '../contexts/UserContext';
import { useDriverPushNotifications } from '@/hooks/use-driver-push-notifications';
export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <UserProvider>
        <PushNotificationBootstrap />
        <AppStack />
        <StatusBar style="auto" />
      </UserProvider>
    </ThemeProvider>
  );
}

function PushNotificationBootstrap() {
  useDriverPushNotifications();

  return null;
}
