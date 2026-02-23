"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  auditByApproverB,
  getAssetJourney,
  reviewByApproverB,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import type { CreativeAsset, CreativeAssetJourney } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { RoleGuard } from "@/app/dashboard/role-guard";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";
import { AuditSection } from "./audit-section";

type AuditResult = {
  verdict: "check" | "fail";
  explanation: string;
  confidence: number;
};

export default function CreativeAssetAuditPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = Array.isArray(params?.assetId)
    ? params.assetId[0]
    : (params?.assetId as string | undefined);

  const { user, token, isReady } = useDashboardSession();
  const [journey, setJourney] = useState<CreativeAssetJourney | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [filesByAsset, setFilesByAsset] = useState<
    Record<string, File | undefined>
  >({});
  const [auditResults, setAuditResults] = useState<Record<string, AuditResult>>(
    {},
  );
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

  useEffect(() => {
    const latestVerdict = journey?.asset.latest_audit_verdict;
    const latestExplanation = journey?.asset.latest_audit_explanation;

    if (!journey || !latestVerdict || !latestExplanation) {
      return;
    }

    setAuditResults((prev) => ({
      ...prev,
      [journey.asset.id]: {
        verdict: latestVerdict,
        explanation: latestExplanation,
        confidence: journey.asset.latest_audit_confidence ?? 0,
      },
    }));
  }, [journey]);

  async function auditB(id: string) {
    if (!token || !journey) return;
    const file = filesByAsset[id];
    if (!file) {
      toast.error("Sube un archivo para auditar");
      return;
    }

    setBusyAction(`audit-${id}`);
    try {
      const response = await auditByApproverB(token, journey.asset.id, file);
      if (response.audit) {
        const { verdict, explanation, confidence } = response.audit;
        setAuditResults((prev) => ({
          ...prev,
          [id]: {
            verdict,
            explanation,
            confidence,
          },
        }));
      }
      toast.success("Auditoría ejecutada");
      await loadJourney();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function approveB(id: string) {
    if (!token) return;
    setBusyAction(`approve-${id}`);
    try {
      await reviewByApproverB(token, id, "approved");
      toast.success("Recurso aprobado");
      router.replace("/dashboard/creative-assets");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAction(null);
    }
  }

  async function rejectB(id: string) {
    if (!token) return;
    setBusyAction(`reject-${id}`);
    try {
      await reviewByApproverB(token, id, "rejected");
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
    <RoleGuard allowed={["approver_b"]}>
      <main className="h-[calc(100vh-3.5rem)] flex flex-col p-4 lg:p-6 overflow-hidden">
        <AuditSection
          auditAssets={mappedAssets}
          busyAction={busyAction}
          filesByAsset={filesByAsset}
          setFilesByAsset={setFilesByAsset}
          auditResults={auditResults}
          auditB={auditB}
          approveB={approveB}
          rejectB={rejectB}
          refreshAll={loadJourney}
          refreshing={refreshing}
        />
      </main>
    </RoleGuard>
  );
}
