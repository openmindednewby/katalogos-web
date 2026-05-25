import * as SecureStore from 'expo-secure-store';

const isWeb = typeof window !== 'undefined';

export const LocalStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) 
      return window.localStorage.getItem(key);
    
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async deleteItem(key: string): Promise<void> {
    if (isWeb) {
      window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
