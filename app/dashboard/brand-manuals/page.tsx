"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { createManual, listAssets, listManuals } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { BrandManual, Role } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { ManualsTable } from "@/app/dashboard/brand-manuals/components/manuals-table";
import { CreateManualDialog } from "@/app/dashboard/brand-manuals/components/create-manual-dialog";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";

export default function BrandManualsPage() {
  const { user, token, setPendingCount, isReady } = useDashboardSession();
  const [manuals, setManuals] = useState<BrandManual[]>([]);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);

  const refreshAll = useCallback(
    async (nextToken: string, role: Role) => {
      try {
        const [manualsResponse, maybeQueue] = await Promise.all([
          listManuals(nextToken),
          role === "approver_a"
            ? listAssets(nextToken, "pending_a")
            : role === "approver_b"
              ? listAssets(nextToken, "pending_b")
              : Promise.resolve({ items: [] }),
        ]);
        setManuals(manualsResponse.items);
        setPendingCount(maybeQueue.items.length);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setDataReady(true);
      }
    },
    [setPendingCount],
  );

  useEffect(() => {
    if (!isReady || !user || !token) return;
    refreshAll(token, user.role);
  }, [isReady, refreshAll, token, user]);

  async function runAction(actionId: string, fn: () => Promise<void>) {
    try {
      setBusyAction(actionId);
      await fn();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function createBrandManual(payload: {
    product_name: string;
    tone: string;
    audience: string;
    extra_context: string;
  }) {
    if (!token || !user) return;
    await runAction("create-manual", async () => {
      await createManual(token, payload);
      await refreshAll(token, user.role);
      toast.success("Brand manual generado");
    });
  }

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
    <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6 w-full overflow-hidden flex flex-col">
      <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
        <section className="space-y-6 min-w-0 flex-1 flex flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">Manuales de marca</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulta el inventario de manuales indexados y revisa su
                contenido completo.
              </p>
            </div>
            {user.role === "creator" ? (
              <CreateManualDialog
                busy={busyAction === "create-manual"}
                onCreateManual={createBrandManual}
              />
            ) : null}
          </div>

          <ManualsTable manuals={manuals} />
        </section>
      </div>
    </main>
  );
}
