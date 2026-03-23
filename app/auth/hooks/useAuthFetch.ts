import { useCallback } from "react";
import { useAuth } from "./useAuth";

export function useAuthFetch() {
  const { authToken, refreshToken, isRefreshing } = useAuth();
  //
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // await if its refreshing
      if (isRefreshing) {
        await new Promise((resolve) => {
          const checkRefresh = () => {
            if (!isRefreshing) {
              resolve(void 0);
            } else {
              setTimeout(checkRefresh, 100);
            }
          };
          checkRefresh();
        });
      }
      // refresh if no token
      let token = authToken;
      if (!token) {
        try {
          token = await refreshToken();
        } catch (e) {
          console.error("Auth required:", e);
          throw new Error("Authentication required: ");
        }
      }
      // bam bam bamm
      if (!token) {
        throw new Error("No access token avaliable");
      }
      // fetch call
      const makeRequest = (tokenToUse: string) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${tokenToUse}`,
          },
        });
      };
      let response = await makeRequest(token);
      // if 401 -> refresh and retry ONCE
      if (response.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            response = await makeRequest(newToken);
          } else {
            throw new Error("Authentication failed");
          }
        } catch (e) {
          console.log("Session expired: ", e);
          throw new Error("Session expired - please log in again");
        }
      }
      //
      return response;
    },
    [authToken, refreshToken, isRefreshing]
  );
  //
  return {
    authFetch,
    isAuthLoading: isRefreshing,
  };
}
