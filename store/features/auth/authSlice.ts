import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isLoggedIn: boolean;
  isOnboarded: boolean | null;
  role: 'user' | 'admin' | null;
  avatarUrl: string | null;
  isTwoFactorAuthenticationEnabled: boolean | null;
  twoFaAuthenticated: boolean | null;
}


const initialState: AuthState = {
  id: null,
  email: null,
  firstName: null,
  lastName: null,
  phoneNumber: null,
  isLoggedIn: false,
  isOnboarded: null,
  role: null,
  avatarUrl: null,
  isTwoFactorAuthenticationEnabled: null,
  twoFaAuthenticated: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signin: (
      state,
      action: PayloadAction<{
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        isOnboarded: boolean;
        role: 'user' | 'admin';
        isTwoFactorAuthenticationEnabled: boolean;
      }>
    ) => {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: true,
      };
    },
    logout: (state) => {
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.phoneNumber = null;
      state.isLoggedIn = false;
      state.isOnboarded = null;
      state.role = null;
      state.avatarUrl = null;
      state.isTwoFactorAuthenticationEnabled = null;
      state.twoFaAuthenticated = null;
    },
    enableTwoFa(state) {
      state.isTwoFactorAuthenticationEnabled = true;
      state.twoFaAuthenticated = true;
    },
    disableTwoFa(state) {
      state.isTwoFactorAuthenticationEnabled = false;
      state.twoFaAuthenticated = false;
    },
    authenticateViaTwoFa(state) {
      state.twoFaAuthenticated = true;
    },
    updateAvatarUrl(state, action: PayloadAction<string>) {
      state.avatarUrl = action.payload;
    },
    updateProfile(state, action: PayloadAction<{
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    }>) {
      if (action.payload.firstName !== undefined) state.firstName = action.payload.firstName;
      if (action.payload.lastName !== undefined) state.lastName = action.payload.lastName;
      if (action.payload.phoneNumber !== undefined) state.phoneNumber = action.payload.phoneNumber;
    }
  },
});

export const { signin, logout, authenticateViaTwoFa, enableTwoFa, disableTwoFa, updateAvatarUrl, updateProfile } = authSlice.actions;

export default authSlice.reducer;
