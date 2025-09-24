import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/auth/AuthContext";
import { NavMenu } from "./components/NavMenu";
import { RouteGuard } from "@/app/auth/RouteGuard";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Mouthful",
  description: "Manage all your libraries in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.className}`}>
      <body className="antialiased bg-zinc-950 text-zinc-100">
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
          <NavMenu />
        </AuthProvider>
      </body>
    </html>
  );
}
