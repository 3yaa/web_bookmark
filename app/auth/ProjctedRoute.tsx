// "use client";
// import { useAuth } from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
// import { useEffect, ReactNode } from "react";
// import { Loading } from "../components/ui/Loading";

// interface ProjectedRouteProps {
//   children: ReactNode;
// }

// export function ProjectedRoute({ children }: ProjectedRouteProps) {
//   const { isAuthenticated, isRefreshing, isInitializing } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isInitializing && !isRefreshing && !isAuthenticated) {
//       router.push("/login");
//     }
//   }, [isAuthenticated, isRefreshing, isInitializing, router]);

//   if (isInitializing || isRefreshing) {
//     return (
//       <Loading customStyle="h-12 w-12 border-gray-400" customBg="bg-black" />
//     );
//   }

//   if (!isAuthenticated) {
//     return null;
//   }

//   return <>{children}</>;
// }
