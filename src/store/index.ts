import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './root-reducer';

// Create the Redux store
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
  // ✅ DO NOT manually add redux-thunk
  // Redux Toolkit already includes it by default
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
