"use client";
import { createContext, useContext, useState } from "react";

type NavContextType = {
  isNavOpen: boolean;
  setIsNavOpen: (isOpen: boolean) => void;
};

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  return (
    <NavContext.Provider value={{ isNavOpen, setIsNavOpen }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (!context) throw new Error("useNav must be used within NavProvider");
  return context;
}