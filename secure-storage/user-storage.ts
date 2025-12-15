import * as SecureStore from 'expo-secure-store';

const USER_KEYS = {
  EMAIL: 'user_email',
  ONBOARDED: 'user_onboarded',
  ROLE: 'user_role'
};

export type StoredUser = {
  email: string | null;
  role: string | null;
  isOnboarded: boolean;
  token?: string | null;
};


/**
 * Save the user's email securely.
 */
export async function saveUserEmail(email: string) {
  try {
    await SecureStore.setItemAsync(USER_KEYS.EMAIL, email);
  } catch (error) {
    console.error('Error saving user email:', error);
  }
}

/**
 * Get the user's stored email.
 */
export async function getUserEmail(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_KEYS.EMAIL);
  } catch (error) {
    console.error('Error retrieving user email:', error);
    return null;
  }
}

/**
 * Mark whether the user has completed onboarding.
 */
export async function setUserOnboarded(value: boolean) {
  try {
    await SecureStore.setItemAsync(USER_KEYS.ONBOARDED, value ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
  }
}

/**
 * Check if the user has completed onboarding.
 */
export async function isUserOnboarded(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(USER_KEYS.ONBOARDED);
    return value === 'true';
  } catch (error) {
    console.error('Error retrieving onboarding status:', error);
    return false;
  }
}


/**
 * Save the user's role securely.
 */
export async function saveUserRole(role: string) {
  try {
    await SecureStore.setItemAsync(USER_KEYS.ROLE, role);
  } catch (error) {
    console.error('Error saving user email:', error);
  }
}

/**
 * Get the user's stored email.
 */
export async function getUserRole(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_KEYS.ROLE);
  } catch (error) {
    console.error('Error retrieving user email:', error);
    return null;
  }
}

export async function saveUserData({
  email,
  role,
  isOnboarded,
  token,
}: {
  email?: string;
  role?: string;
  isOnboarded?: boolean;
  token?: string;
}) {
  const promises = [];

  if (email) promises.push(SecureStore.setItemAsync(USER_KEYS.EMAIL, email));
  if (role) promises.push(SecureStore.setItemAsync(USER_KEYS.ROLE, role));
  if (isOnboarded !== undefined)
    promises.push(SecureStore.setItemAsync(USER_KEYS.ONBOARDED, isOnboarded ? 'true' : 'false'));

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

/**
 * Get all stored user info in one go
 */
export async function getUser(): Promise<StoredUser | null> {
  try {
    const [email, role, onboarded] = await Promise.all([
      SecureStore.getItemAsync(USER_KEYS.EMAIL),
      SecureStore.getItemAsync(USER_KEYS.ROLE),
      SecureStore.getItemAsync(USER_KEYS.ONBOARDED),
    ]);

    return {
      email,
      role,
      isOnboarded: onboarded === 'true',
    };
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
}

/**
 * Clear all user data (e.g., on logout).
 */
export async function clearUserStorage() {
  try {
    await Promise.all(Object.values(USER_KEYS).map(key => SecureStore.deleteItemAsync(key)));
  } catch (error) {
    console.error('Error clearing user storage:', error);
  }
}

// Export keys (optional, if needed externally)
export const UserStorageKeys = USER_KEYS;
