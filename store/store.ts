import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import themeReducer from './features/theme/themeSlice';

const reduxToolkitStore = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer
  },
})

export default reduxToolkitStore;

export type RootState = ReturnType<typeof reduxToolkitStore.getState>;
export type AppDispatch = typeof reduxToolkitStore.dispatch;