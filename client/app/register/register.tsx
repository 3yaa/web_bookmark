"use client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export function Register() {
  const { setAuthToken } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registration failed`);
      }

      const data = await response.json();
      setAuthToken(data.accessToken);
      router.push("/");
    } catch (error) {
      console.log("registration failed: ", error);
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        {/* Outer gradient border */}
        <div className="rounded-2xl bg-gradient-to-b from-zinc-700/30 via-zinc-800/20 to-zinc-900/30 p-0.5">
          {/* Inner card */}
          <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-zinc-100 mb-2">
                Register
              </h2>
              <p className="text-zinc-400 text-sm">
                Create your account to wonderland
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-3">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg 
                             text-zinc-200 placeholder-zinc-500 
                             focus:outline-none focus:ring-2 focus:ring-zinc-600/50 focus:border-zinc-600
                             transition-all duration-200"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg 
                             text-zinc-200 placeholder-zinc-500 
                             focus:outline-none focus:ring-2 focus:ring-zinc-600/50 focus:border-zinc-600
                             transition-all duration-200"
                    placeholder="Choose a username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-10 pr-12 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg 
                             text-zinc-200 placeholder-zinc-500 
                             focus:outline-none focus:ring-2 focus:ring-zinc-600/50 focus:border-zinc-600
                             transition-all duration-200"
                    placeholder="Create a password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-zinc-300 text-zinc-500 transition-colors hover:cursor-pointer"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !formData.email ||
                  !formData.username ||
                  !formData.password
                }
                className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-zinc-700 to-zinc-800 
                  hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg hover:shadow-emerald-500/20 hover:text-white
                  disabled:from-zinc-800 disabled:to-zinc-900 disabled:opacity-50
                  disabled:border-zinc-800 disabled:shadow-none
                  text-zinc-200 font-semibold rounded-lg 
                  border border-zinc-700/50 hover:border-emerald-500/60
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
                  disabled:cursor-not-allowed hover:cursor-pointer
                  group relative overflow-hidden
                  transform hover:scale-[1.02] active:scale-[0.98]
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
                  before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 before:ease-out"
              >
                <span
                  className={`flex items-center justify-center gap-2 relative z-10 ${
                    isLoading ? "opacity-0" : "opacity-100"
                  } transition-opacity`}
                >
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </div>

            <div className="flex justify-end items-center mt-6 text-center">
              <button
                onClick={() => router.push("/login")}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 
                         hover:text-emerald-600 hover:underline hover:cursor-pointer 
                         transition-all duration-200 group"
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Sign In Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
