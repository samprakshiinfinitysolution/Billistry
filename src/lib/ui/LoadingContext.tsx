"use client";

import React, { createContext, useContext } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
};

export const LoadingContext = createContext<LoadingContextType>({ isLoading: false, setLoading: () => {} });

export const useLoading = () => useContext(LoadingContext);

export default LoadingContext;
