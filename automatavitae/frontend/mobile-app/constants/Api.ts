import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to connect to localhost, or localhost for iOS/web
// Optionally check process.env.EXPO_PUBLIC_API_URL if defined
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001/api/cv' : 'http://localhost:3001/api/cv');
