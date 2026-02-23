"use client";

import Link from "next/link";
import { BookOpen, Hexagon, LogOut, Sparkles } from "lucide-react";

import type { Role, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
};

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const BASE_MENU: SidebarItem[] = [
  { id: "brand-manuals", label: "Manuales de marca", icon: BookOpen },
  { id: "creative-assets", label: "Contenido", icon: Sparkles },
];

const MENU_BY_ROLE: Record<Role, SidebarItem[]> = {
  creator: BASE_MENU,
  approver_a: BASE_MENU,
  approver_b: BASE_MENU,
};

export function AppSidebar({
  user,
  activeView,
  setActiveView,
  onLogout,
}: AppSidebarProps) {
  const items = MENU_BY_ROLE[user.role];

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-3">
          <Hexagon className="size-6" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Content Suite</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.full_name}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeView === item.id}
                      onClick={() => setActiveView(item.id)}
                      tooltip={item.label}
                      asChild
                    >
                      <Link href={`/dashboard/${item.id}`}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <Button
          variant="outline"
          onClick={onLogout}
          className="w-full justify-start gap-2"
        >
          <LogOut className="size-4" />
          <span>Salir</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
