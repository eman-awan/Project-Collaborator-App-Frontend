import * as SecureStore from 'expo-secure-store';


export const JWTStorage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync('token', token);
  },
  async getToken() {
    return await SecureStore.getItemAsync('token');
  },
  async removeToken() {
    await SecureStore.deleteItemAsync('token');
  }
}