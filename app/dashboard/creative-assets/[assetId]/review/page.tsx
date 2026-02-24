"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { getAssetJourney, reviewByApproverA } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import type { CreativeAsset, CreativeAssetJourney } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/app/dashboard/role-guard";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";
import { ReviewSection } from "./review-section";

export default function CreativeAssetReviewPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = Array.isArray(params?.assetId)
    ? params.assetId[0]
    : (params?.assetId as string | undefined);

  const { user, token, isReady } = useDashboardSession();
  const [journey, setJourney] = useState<CreativeAssetJourney | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [rejections, setRejections] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const mappedAssets = useMemo(() => {
    if (!journey) return [];
    const assetWithManual = {
      ...(journey.asset as CreativeAsset),
      manual_product_name: journey.asset.manual_product_name,
    } as CreativeAsset & { manual_product_name?: string };
    return [assetWithManual];
  }, [journey]);

  const loadJourney = useCallback(() => {
    if (!assetId || !token) return;
    setRefreshing(true);
    getAssetJourney(token, assetId)
      .then((data) => setJourney(data))
      .catch((error) => {
        toast.error(getErrorMessage(error));
        router.replace("/dashboard/creative-assets");
      })
      .finally(() => setRefreshing(false));
  }, [assetId, router, token]);

  useEffect(() => {
    if (!assetId || !token || !isReady) return;
    loadJourney();
  }, [assetId, isReady, loadJourney, token]);

  async function approveA(id: string) {
    if (!token) return;
    setBusyAction(`approve-${id}`);
    try {
      await reviewByApproverA(token, id, "pending_b");
      await loadJourney();
      toast.success("Recurso aprobado y enviado a auditoría");
      router.replace("/dashboard/creative-assets");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function rejectA(id: string) {
    if (!token) return;
    const reason = rejections[id]?.trim();
    if (!reason) {
      toast.error("Agrega comentarios de rechazo");
      return;
    }
    setBusyAction(`reject-${id}`);
    try {
      await reviewByApproverA(token, id, "rejected", reason);
      await loadJourney();
      toast.success("Recurso rechazado");
      router.replace("/dashboard/creative-assets");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  if (!journey || refreshing || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Cargando recurso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <RoleGuard allowed={["approver_a"]}>
      <main className="min-h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col p-4 lg:p-6 md:overflow-hidden w-full max-w-full">
        <ReviewSection
          reviewAssets={mappedAssets}
          busyAction={busyAction}
          rejections={rejections}
          setRejections={setRejections}
          approveA={approveA}
          rejectA={rejectA}
          refreshAll={loadJourney}
          refreshing={refreshing}
        />
      </main>
    </RoleGuard>
  );
}
