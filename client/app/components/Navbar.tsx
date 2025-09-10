import { Sidebar, SidebarBody, SidebarLink } from "./ui/Sidebar";
import { IconDashboard, IconBookmark } from "@tabler/icons-react";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconDashboard className="h-5 w-5" />,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: <IconBookmark className="h-5 w-5" />,
  },
];

// If this is inside a component:
export default function Layout() {
  return (
    <Sidebar>
      <SidebarBody>
        <div className="flex flex-col space-y-2">
          {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
          ))}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
