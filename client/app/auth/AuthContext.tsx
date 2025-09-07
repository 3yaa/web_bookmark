"use client";
import { useState, createContext, ReactNode } from "react";

interface AuthContextType {
  authToken: string | null;
  setAuthToken: (authToken: string | null) => void;
  isAuthenticated: boolean;
}

// auth context
export const AuthTokenContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);

  const value = {
    authToken,
    setAuthToken,
    isAuthenticated: !!authToken,
  };

  return (
    <AuthTokenContext.Provider value={value}>
      {children}
    </AuthTokenContext.Provider>
  );
}
