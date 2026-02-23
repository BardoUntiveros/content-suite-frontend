"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import type { Role } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";

type RoleGuardProps = {
  allowed: Role[];
  fallbackHref?: string;
  children: React.ReactNode;
};

export function RoleGuard({
  allowed,
  fallbackHref = "/dashboard",
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isReady } = useDashboardSession();

  const isAllowed = !!user && allowed.includes(user.role);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAllowed) {
      router.replace(fallbackHref);
    }
  }, [fallbackHref, isAllowed, isReady, router, user]);

  if (!isReady || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Cargando...
          </p>
        </div>
      </main>
    );
  }

  if (!isAllowed) return null;

  return <>{children}</>;
}
