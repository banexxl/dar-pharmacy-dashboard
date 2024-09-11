import { configureStore } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch as useReduxDispatch, useSelector as useReduxSelector } from 'react-redux';
import { ThunkAction } from 'redux-thunk';  // Import redux-thunk
import type { Action } from '@reduxjs/toolkit';

import { rootReducer } from './root-reducer';

// Configure store with explicit middleware
export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Define AppThunk for use in thunk actions
export type AppThunk = ThunkAction<void, RootState, unknown, Action>;

// Custom hooks for dispatch and selector with TypeScript types
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useDispatch = () => useReduxDispatch<AppDispatch>();
