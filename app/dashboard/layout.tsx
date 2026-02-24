"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { AppSidebar } from "@/app/dashboard/app-sidebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DashboardSessionProvider,
  useDashboardSession,
} from "./dashboard-session";
import { USER_ROLE_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isReady } = useDashboardSession();

  const activeView = useMemo(() => pathname.split("/")[2] ?? "", [pathname]);

  if (!isReady || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Cargando panel...
          </p>
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar
        user={user}
        activeView={activeView}
        setActiveView={(view) => router.push(`/dashboard/${view}`)}
        onLogout={logout}
      />
      <SidebarInset className="min-w-0 flex-1 overflow-hidden flex flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Link
            href="/dashboard"
            className="text-sm font-semibold hover:underline"
          >
            Inicio
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline">{USER_ROLE_LABEL[user.role]}</Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.refresh()}
              className="text-muted-foreground hover:text-foreground"
            >
              <span className="text-xs">↻</span>
            </Button>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardSessionProvider>
  );
}
