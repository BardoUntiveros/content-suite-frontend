"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { listAssetsHistory } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import type { CreativeAssetHistoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";
import { CreativeAssetsTable } from "./components/creative-assets-table";
import { Plus } from "lucide-react";

export default function CreativeAssetsPage() {
  const { user, token, isReady } = useDashboardSession();
  const [assets, setAssets] = useState<CreativeAssetHistoryItem[]>([]);
  const [dataReady, setDataReady] = useState(false);

  const refreshAll = useCallback(async () => {
    if (!token) return;
    try {
      const response = await listAssetsHistory(token);
      setAssets(response.items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDataReady(true);
    }
  }, [token]);

  useEffect(() => {
    if (!isReady || !token) return;
    refreshAll();
  }, [isReady, refreshAll, token]);

  const isCreator = user?.role === "creator";
  const isApproverA = user?.role === "approver_a";
  const isApproverB = user?.role === "approver_b";

  if (!user || !dataReady) {
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
    <>
      <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6 w-full overflow-hidden flex flex-col">
        <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
          <section className="space-y-6 min-w-0 flex-1 flex flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">Contenido generado</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Lista consolidada con acceso a trazabilidad de cada recurso.
                </p>
              </div>
              {isCreator ? (
                <Button asChild size="sm">
                  <Link href="/dashboard/creative-assets/new">
                    <Plus className="size-4" />
                    Nuevo contenido
                  </Link>
                </Button>
              ) : null}
            </div>

            <CreativeAssetsTable
              assets={assets}
              isApproverA={isApproverA}
              isApproverB={isApproverB}
            />
          </section>
        </div>
      </main>
    </>
  );
}
