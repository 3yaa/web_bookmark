"use client";
import {
  ReactNode,
  useState,
  createContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";

interface AuthContextType {
  authToken: string | null;
  setAuthToken: (authToken: string | null) => void;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isInitializing: boolean;
  refreshToken: () => Promise<string | null>;
}

// auth context
export const AuthTokenContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // parse jwt to find expiration time
  const parseTokenExpiry = useCallback((token: string): number | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000; //miliseconds -- exp: unix timestamp in seconds
    } catch (e) {
      console.error("failed to parse token: ", e);
      return null;
    }
  }, []);

  // refreshes token 1 min before expiration
  const scheduleNextRefresh = useCallback(
    (token: string, refreshFunc: () => Promise<string | null>) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      //
      const expiryTime = parseTokenExpiry(token);
      if (!expiryTime) return;
      //schedules to call the refreshfunc after refreshtime
      const refreshTime = expiryTime - Date.now() - 1 * 60 * 1000;
      if (refreshTime > 0) {
        refreshTimerRef.current = setTimeout(() => {
          refreshFunc();
        }, refreshTime);
      }
    },
    [parseTokenExpiry]
  );

  // call server for new auth token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }
    setIsRefreshing(true);
    // make call
    const refreshPromise = (async () => {
      try {
        const response = await fetch(`/api/auth/refresh`, {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setAuthToken(null);
            throw new Error("session expired");
          }
          throw new Error("token refresh failed");
        }
        //
        const data = await response.json();
        const newToken = data.accessToken;
        //
        setAuthToken(newToken);
        scheduleNextRefresh(newToken, refreshToken);
        return newToken;
      } catch (e) {
        console.error("Token refresh failed: ", e);
        setAuthToken(null);
        throw e;
      } finally {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, [scheduleNextRefresh]);

  // on mount get token
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthPage) {
        setIsInitializing(false);
        return;
      }
      try {
        await refreshToken();
      } catch (e) {
        console.log("No valid session found: ", e);
      } finally {
        setIsInitializing(false);
      }
    };
    //
    initializeAuth();
    //
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handles case when timer goes over bc went to another site
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && authToken) {
        const expiryTime = parseTokenExpiry(authToken);
        if (expiryTime && Date.now() >= expiryTime - 5 * 60 * 1000) {
          refreshToken();
        }
      }
    };
    //
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authToken, refreshToken, parseTokenExpiry]);

  // sets token with the scheduler
  const setAuthTokenWithScheduling = useCallback(
    (token: string | null) => {
      setAuthToken(token);
      if (token) {
        scheduleNextRefresh(token, refreshToken);
      } else if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    },
    [scheduleNextRefresh, refreshToken]
  );

  const value = {
    authToken,
    setAuthToken: setAuthTokenWithScheduling,
    isAuthenticated: !!authToken,
    isRefreshing,
    isInitializing,
    refreshToken,
  };

  return (
    <AuthTokenContext.Provider value={value}>
      {children}
    </AuthTokenContext.Provider>
  );
}
