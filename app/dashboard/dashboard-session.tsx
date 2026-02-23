"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getCurrentUser, listAssets } from "@/lib/api";
import { clearStoredToken, getStoredToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error";
import { User } from "@/lib/types";

export type DashboardSession = {
  user: User | null;
  token: string;
  pendingCount: number;
  setPendingCount: (count: number) => void;
  refreshing: boolean;
  refreshPendingCount: (
    nextToken?: string,
    role?: User["role"],
  ) => Promise<void>;
  logout: () => void;
  isReady: boolean;
};

const DashboardSessionContext = createContext<DashboardSession | undefined>(
  undefined,
);

export function DashboardSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refreshPendingCount = useCallback(
    async (nextToken?: string, role?: User["role"]) => {
      const activeToken = nextToken ?? token;
      const activeRole = role ?? user?.role;
      if (!activeToken || !activeRole) return;

      setRefreshing(true);
      try {
        const queueStatus =
          activeRole === "approver_a"
            ? "pending_a"
            : activeRole === "approver_b"
              ? "pending_b"
              : undefined;
        const pending = await listAssets(activeToken, queueStatus);
        setPendingCount(pending.items.length);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setRefreshing(false);
      }
    },
    [token, user?.role],
  );

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const me = await getCurrentUser(storedToken);
        setUser(me);
        setToken(storedToken);
        await refreshPendingCount(storedToken, me.role);
      } catch (error) {
        toast.error(getErrorMessage(error));
        clearStoredToken();
        router.replace("/");
        return;
      } finally {
        setIsReady(true);
      }
    })();
  }, [refreshPendingCount, router]);

  const logout = useCallback(() => {
    clearStoredToken();
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      pendingCount,
      setPendingCount,
      refreshing,
      refreshPendingCount,
      logout,
      isReady,
    }),
    [
      isReady,
      logout,
      pendingCount,
      refreshPendingCount,
      refreshing,
      token,
      user,
    ],
  );

  return (
    <DashboardSessionContext.Provider value={value}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession() {
  const ctx = useContext(DashboardSessionContext);
  if (!ctx) {
    throw new Error(
      "useDashboardSession must be used within DashboardSessionProvider",
    );
  }
  return ctx;
}
