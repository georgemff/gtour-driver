import AsyncStorage from '@react-native-async-storage/async-storage';

export const JWT_TOKEN_STORAGE_KEY = 'jwt_token';
const AUTH_USER_STORAGE_KEY = 'auth_user';

export async function getStoredAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(JWT_TOKEN_STORAGE_KEY);
}

export async function getStoredAuthUser<T = unknown>(): Promise<T | null> {
  const storedUser = await AsyncStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as T;
  } catch (_error) {
    await AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export async function storeAuthSession(token: string, user: unknown): Promise<void> {
  await AsyncStorage.multiSet([
    [JWT_TOKEN_STORAGE_KEY, token],
    [AUTH_USER_STORAGE_KEY, JSON.stringify(user)],
  ]);
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([JWT_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY]);
}
