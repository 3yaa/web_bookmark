"use client";
import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/navbar/Sidebar";
import { type Links } from "@/components/navbar/SidebarContext";
import { Home, BookOpen, Film, User } from "lucide-react";

const links: Links[] = [
  { href: "/", label: "Home", icon: <Home /> },
  { href: "/book", label: "Books", icon: <BookOpen /> },
  { href: "/movie", label: "Film", icon: <Film /> },
  { href: "/profile", label: "Profile", icon: <User /> },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-0 top-0 h-screen bg-gray-800 w-navbar rounded-tr-lg rounded-br-lg">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody>
          <div className="flex flex-col h-full justify-between">
            {/* TOP */}
            <SidebarLink link={links[0]} />
            {/* MIDDLE SECTION */}
            <div className="flex flex-col justify-evenly">
              <SidebarLink link={links[1]} className="my-auto" />
              <SidebarLink link={links[2]} className="my-auto" />
            </div>
            {/* END */}
            <SidebarLink link={links[3]} />
          </div>
        </SidebarBody>
      </Sidebar>
    </nav>
  );
}
