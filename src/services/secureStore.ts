import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sipota_auth_token';

/**
 * Menyimpan token autentikasi ke Hardware Secure Storage (Android Keystore / iOS Keychain)
 * Mengacu pada PRD-Mobile.md Bagian 6.1 (AAA di Mobile)
 */
export async function saveAuthToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // noop
    }
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // noop
    }
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
