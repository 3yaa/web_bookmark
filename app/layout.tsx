import type { Metadata } from "next";
import { Cinzel, Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/auth/AuthContext";
import { NavMenu } from "./components/NavMenu";
import { RouteGuard } from "@/app/auth/RouteGuard";
import { NavProvider } from "./components/NavContext";

const geist = Geist({ subsets: ["latin"], display: "swap" });

// title text
const cinzel = Cinzel({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "600", "700"],
	variable: "--font-cinzel",
});

export const metadata: Metadata = {
	title: "Mouthful",
	description: "Manage all your libraries in one place",
	icons: {
		icon: "/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${geist.className} ${cinzel.variable}`}>
			<body className="antialiased bg-zinc-950 text-zinc-100">
				<AuthProvider>
					<NavProvider>
						<RouteGuard>{children}</RouteGuard>
						<NavMenu />
					</NavProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
