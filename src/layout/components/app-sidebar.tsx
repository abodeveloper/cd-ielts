import {
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
} from "@tabler/icons-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  RiAwardLine,
  RiBookLine,
  RiHome2Line,
  RiUserLine,
} from "@remixicon/react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/profile/home",
      icon: RiHome2Line,
    },
    {
      title: "My results",
      url: "/profile/results",
      icon: RiAwardLine,
    },
    {
      title: "Profile",
      url: "/profile/detail",
      icon: RiUserLine,
    },
    {
      title: "Exams",
      url: "#", // yoki to‘g‘ri marshrutga o‘zgartiring
      icon: RiBookLine,
      isActive: false, // dinamik holat useLocation orqali boshqariladi
      items: [
        { title: "Speaking", url: "/profile/exams/speakings" },
        { title: "Listening", url: "/profile/exams/listenings" },
        { title: "Reading", url: "/profile/exams/readings" },
        { title: "Wtiring", url: "/profile/exams/writings" },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className={
          "flex flex-row items-center justify-between gap-3 border-b h-16"
        }
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconInnerShadowTop className="!size-5" />
                </div>
                <span className="text-base font-semibold">MOCK IELTS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
