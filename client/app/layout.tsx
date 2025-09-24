import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/auth/AuthContext";
import { NavMenu } from "./components/NavMenu";

const geist = Geist({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "bookmark",
  description: "fix yo shi",
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
          {children}
          <NavMenu />
        </AuthProvider>
      </body>
    </html>
  );
}
