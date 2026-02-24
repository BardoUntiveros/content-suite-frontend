"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { generateAsset, listManuals } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import type { AssetType, BrandManual } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { GenerateSection } from "@/app/dashboard/creative-assets/new/components/generate-section";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";

export default function CreativeAssetsNewPage() {
  const router = useRouter();
  const { user, token, isReady } = useDashboardSession();
  const [manuals, setManuals] = useState<BrandManual[]>([]);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [selectedManual, setSelectedManual] = useState("");
  const [creativeForm, setCreativeForm] = useState<{
    manual_id: string;
    asset_type: AssetType;
    brief: string;
  }>({
    manual_id: "",
    asset_type: "product_description",
    brief: "Lanzamiento para ecommerce, foco en beneficios, CTA corto",
  });
  const [dataReady, setDataReady] = useState(false);

  const selectedManualDoc = useMemo(
    () =>
      manuals.find(
        (manual) => manual.id === (selectedManual || creativeForm.manual_id),
      ),
    [creativeForm.manual_id, manuals, selectedManual],
  );

  const refreshAll = useCallback(
    async (nextToken?: string) => {
      const activeToken = nextToken ?? token;
      if (!activeToken) return;
      try {
        const manualsResponse = await listManuals(activeToken);
        setManuals(manualsResponse.items);
        if (manualsResponse.items.length > 0) {
          setSelectedManual((prev) => prev || manualsResponse.items[0].id);
          setCreativeForm((prev) => ({
            ...prev,
            manual_id: prev.manual_id || manualsResponse.items[0].id,
          }));
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setDataReady(true);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!isReady || !user || !token) return;
    if (user.role !== "creator") {
      router.replace("/dashboard/creative-assets");
      return;
    }
    refreshAll(token);
  }, [isReady, refreshAll, router, token, user]);

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

  async function createCreativeAsset() {
    if (!token || !creativeForm.manual_id) {
      toast.error("Selecciona un manual primero");
      return;
    }
    await runAction("create-asset", async () => {
      await generateAsset(token, creativeForm);
      await refreshAll(token);
      toast.success("Recurso generado con contexto de marca");
      router.push("/dashboard/creative-assets");
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
        <GenerateSection
          manuals={manuals}
          creativeForm={creativeForm}
          setCreativeForm={setCreativeForm}
          selectedManualDoc={selectedManualDoc}
          setSelectedManual={setSelectedManual}
          busyAction={busyAction}
          onCreateAsset={createCreativeAsset}
        />
      </div>
    </main>
  );
}
