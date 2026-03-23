import { AuthTokenContext } from "@/app/auth/AuthContext";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthTokenContext);
  if (!context) {
    throw new Error("useAuth must be used within an authprovider");
  }
  return context;
}
