import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Role } from "@/shared/enums/role.enum";
import { useAuthStore } from "@/store/auth-store";
import {
  RiAwardLine,
  RiBookLine,
  RiDashboardLine,
  RiGroupLine,
  RiHome2Line,
  RiProfileLine,
  RiUserCommunityLine,
  RiUserLine
} from "@remixicon/react";
import {
  IconHelp,
  IconInnerShadowTop,
  IconSettings,
} from "@tabler/icons-react";
import * as React from "react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

// Talabalar uchun menyu ma'lumotlari
const studentData = {
  navMain: [
    {
      title: "Home",
      url: "/student/home",
      icon: RiHome2Line,
    },
    {
      title: "My results",
      url: "/studenr/results",
      icon: RiAwardLine,
    },
    {
      title: "Profile",
      url: "/student/profile",
      icon: RiProfileLine,
    },
    {
      title: "Exams",
      url: "#",
      icon: RiBookLine,
      isActive: false,
      items: [
        { title: "Speaking", url: "/student/exams/speakings" },
        { title: "Listening", url: "/student/exams/listenings" },
        { title: "Reading", url: "/student/exams/readings" },
        { title: "Writing", url: "/student/exams/writings" },
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

// O‘qituvchilar uchun menyu ma'lumotlari
const teacherData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/teacher/dashboard",
      icon: RiDashboardLine,
    },
    {
      title: "Groups",
      url: "/teacher/groups",
      icon: RiUserCommunityLine,
    },
    {
      title: "Students",
      url: "/teacher/students",
      icon: RiGroupLine,
    },
    {
      title: "Profile",
      url: "/teacher/profile",
      icon: RiProfileLine,
    },
    // {
    //   title: "Exams",
    //   url: "#",
    //   icon: RiBookLine,
    //   isActive: false,
    //   items: [
    //     { title: "Speaking", url: "/profile/exams/speakings" },
    //     { title: "Listening", url: "/profile/exams/listenings" },
    //     { title: "Reading", url: "/profile/exams/readings" },
    //     { title: "Writing", url: "/profile/exams/writings" },
    //   ],
    // },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/teacher/profile",
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
  const { user } = useAuthStore();
  const data = user?.role === Role.TEACHER ? teacherData : studentData;

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
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
