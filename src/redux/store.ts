// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import supplierReducer from "./slices/supplierSlice";
import customerReducer from "./slices/customerSlice";

export const store = configureStore({
  reducer: {
    supplier: supplierReducer,
    customer: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export hooks for convenience
export { useAppDispatch, useAppSelector } from './hooks';
