"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Logout() {
  const { setAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    setError("");
    //
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MOUTHFUL_URL}/auth/logout`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok && response.status !== 204) {
        throw new Error(`Logout failed`);
      }
      setAuthToken(null);
      router.push("/login");
    } catch (error) {
      console.log("Logout failed: ", error);
      setError("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogout();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-100">
            Are you sure you want to logout?
          </h2>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-800 
                     text-white font-medium rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging out..." : "Yes, Logout"}
          </button>

          <button
            onClick={() => router.back()}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 
                     text-white font-medium rounded-lg transition-colors
                     focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
