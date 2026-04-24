import { ThemeProvider as NavigationThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-reanimated';

import { ThemeProvider, useAppTheme } from '../context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigation() {
  const { isDark } = useAppTheme();
  const router = useRouter();

  const HeaderLeft = () => (
    <TouchableOpacity onPress={() => router.replace('/')} style={{ marginLeft: 8, padding: 8 }}>
      <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
    </TouchableOpacity>
  );

  const headerOptions = {
    headerStyle: { backgroundColor: isDark ? '#000000' : '#ffffff' },
    headerTintColor: isDark ? '#ffffff' : '#000000',
    headerLeft: () => <HeaderLeft />,
    animation: 'slide_from_right' as const, // Added slide animation for fluid navigation
  };

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        <Stack.Screen name="create" options={{ title: 'Crear CV', ...headerOptions }} />
        <Stack.Screen name="analyze" options={{ title: 'Analizar CV', ...headerOptions }} />
        <Stack.Screen name="settings" options={{ title: 'Ajustes', ...headerOptions }} />

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', ...headerOptions }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigation />
    </ThemeProvider>
  );
}
