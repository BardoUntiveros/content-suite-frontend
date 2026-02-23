"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
  Zap,
  Activity,
} from "lucide-react";

import { getAssetJourney } from "@/lib/api";
import { getErrorMessage } from "@/lib/error";
import { CreativeAssetJourney, JourneyEventType } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownView } from "@/components/ui/markdown-view";
import { useDashboardSession } from "@/app/dashboard/dashboard-session";

const EVENT_LABEL: Record<JourneyEventType, string> = {
  asset_created: "Recurso generado",
  review_a_approved: "Gobernanza aprobada",
  review_a_rejected: "Gobernanza rechazada",
  audit_check: "Auditoría multimodal aprobada",
  audit_fail: "Auditoría multimodal fallida",
};

const EVENT_ICON: Record<JourneyEventType, React.ElementType> = {
  asset_created: Zap,
  review_a_approved: CheckCircle2,
  review_a_rejected: XCircle,
  audit_check: ShieldCheck,
  audit_fail: AlertCircle,
};

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(parsed);
}

export default function AssetJourneyPage() {
  const params = useParams<{ assetId?: string }>();
  const assetId = params?.assetId?.trim() || "";
  const router = useRouter();
  const { user, token, isReady } = useDashboardSession();
  const [loading, setLoading] = useState(true);
  const [journey, setJourney] = useState<CreativeAssetJourney | null>(null);

  useEffect(() => {
    async function loadJourney() {
      if (!assetId) {
        toast.error("ID de recurso inválido");
        router.replace("/dashboard/creative-assets");
        return;
      }

      if (!token || !user) return;

      try {
        const response = await getAssetJourney(token, assetId);
        setJourney(response);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    if (isReady) {
      loadJourney();
    }
  }, [assetId, isReady, router, token, user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Cargando datos del recurso...
          </p>
        </div>
      </main>
    );
  }

  if (!journey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <AlertCircle className="size-10 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recurso no encontrado</h2>
          <p className="text-sm text-muted-foreground">
            No pudimos encontrar la trazabilidad de este recurso.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/dashboard/creative-assets">Volver</Link>
          </Button>
        </div>
      </main>
    );
  }

  const statusVariant =
    journey.asset.workflow_status === "approved"
      ? "default"
      : journey.asset.workflow_status === "rejected"
        ? "destructive"
        : "secondary";

  return (
    <main className="h-[calc(100vh-4rem)] p-6 lg:p-8 overflow-hidden">
      <div className="mx-auto grid w-full gap-8 h-full overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Recorrido de trazabilidad del recurso
          </h2>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/creative-assets">
              <ArrowLeft className="mr-2 size-4" /> Volver
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Registro de auditoría completo que muestra cada paso del ciclo de
          vida.
        </p>

        <div className="grid gap-8 md:grid-cols-12 h-full overflow-hidden">
          <div className="md:col-span-5 flex flex-col gap-6 h-full overflow-hidden">
            <Card className="gap-0">
              <CardHeader className="border-b border-muted">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      Metadatos del recurso
                    </CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                      ID: {journey.asset.id.split("-")[0] + "..."}
                    </span>
                  </div>
                  <Badge variant={statusVariant} className="font-semibold">
                    {STATUS_LABEL[journey.asset.workflow_status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Producto Objetivo
                  </h4>
                  <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                    {journey.asset.manual_product_name}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Brief Creativo
                  </h4>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {journey.asset.brief}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Estado Actual
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">
                      {STATUS_LABEL[journey.asset.workflow_status]}
                    </span>
                    {journey.asset.latest_audit_confidence && (
                      <Badge
                        variant="outline"
                        className="font-mono bg-muted/30"
                      >
                        Puntuación: {journey.asset.latest_audit_confidence}
                      </Badge>
                    )}
                  </div>
                </div>
                {journey.asset.rejection_reason && (
                  <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-100 dark:border-red-900/50">
                    <h4 className="text-xs font-semibold uppercase text-red-600 dark:text-red-400 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      Motivo de Rechazo
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {journey.asset.rejection_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="flex flex-col gap-0 flex-1 overflow-hidden">
              <CardHeader className="border-b border-muted gap-0">
                <CardTitle className="text-base flex items-center gap-2">
                  Contenido generado
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-5">
                    <MarkdownView
                      content={journey.asset.generated_text}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-7 flex flex-col h-full min-h-0">
            <Card className="h-full flex-1 gap-0">
              <CardHeader className="border-b border-muted">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock3 className="size-4" />
                  Línea de tiempo
                </CardTitle>
                <CardDescription className="text-xs">
                  Registro cronológico de cambios de estado y acciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                {journey.events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                    <Clock3 className="size-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      Aún no hay eventos registrados
                    </p>
                    <p className="text-xs mt-1">
                      Este recurso no tiene historial de trazabilidad.
                    </p>
                  </div>
                ) : (
                  <div className="relative space-y-0 pl-6 border-l-2 border-muted/50 ml-3">
                    {journey.events.map((event, index) => {
                      const EventIcon =
                        EVENT_ICON[event.event_type] || Activity;
                      const isLast = index === journey.events.length - 1;

                      let colorClass =
                        "text-blue-500 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800";
                      if (
                        event.event_type.includes("approved") ||
                        event.event_type === "audit_check"
                      ) {
                        colorClass =
                          "text-emerald-500 bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800";
                      } else if (
                        event.event_type.includes("rejected") ||
                        event.event_type === "audit_fail"
                      ) {
                        colorClass =
                          "text-red-500 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800";
                      } else if (event.event_type === "asset_created") {
                        colorClass =
                          "text-purple-500 bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800";
                      }

                      return (
                        <div
                          key={event.id}
                          className={`relative pb-10 ${isLast ? "pb-0" : ""}`}
                        >
                          <div
                            className={`absolute -left-[40px] flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${colorClass
                              .split(" ")
                              .filter(
                                (c) =>
                                  c.startsWith("border-") ||
                                  c.startsWith("text-"),
                              )
                              .join(" ")}`}
                          >
                            <EventIcon className="size-3.5" />
                          </div>

                          <div className="bg-muted/10 border border-muted/40 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-sm flex items-center gap-2">
                                {EVENT_LABEL[event.event_type]}
                              </h3>
                              <span className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded">
                                {formatDate(event.created_at)}
                              </span>
                            </div>

                            {event.note && (
                              <p className="text-sm text-foreground/80 mt-2 mb-3">
                                {event.note}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-xs mt-3 bg-background p-2 rounded-md border border-border/40">
                              {event.from_status && (
                                <div className="flex items-center text-muted-foreground">
                                  <span className="uppercase text-[10px] font-semibold mr-1.5 opacity-70">
                                    De
                                  </span>
                                  <span className="bg-muted/50 px-1.5 py-0.5 rounded">
                                    {STATUS_LABEL[event.from_status]}
                                  </span>
                                </div>
                              )}

                              {event.from_status && (
                                <ArrowLeft className="size-3 text-muted-foreground rotate-180" />
                              )}

                              <div className="flex items-center font-medium">
                                <span className="uppercase text-[10px] font-semibold mr-1.5 text-muted-foreground opacity-70">
                                  A
                                </span>
                                <span className="bg-muted px-1.5 py-0.5 rounded">
                                  {STATUS_LABEL[event.to_status]}
                                </span>
                              </div>

                              {event.actor_name && (
                                <>
                                  <div className="w-px h-3 bg-border mx-1"></div>
                                  <div className="flex items-center text-muted-foreground">
                                    <span className="uppercase text-[10px] font-semibold mr-1.5 opacity-70">
                                      Por
                                    </span>
                                    <span>{event.actor_name}</span>
                                    <span className="ml-1 opacity-70">
                                      ({event.actor_role || "desconocido"})
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>

                            {event.payload &&
                              Object.keys(event.payload).length > 0 && (
                                <div className="mt-3">
                                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex cursor-pointer items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                      <span className="border-b border-dashed border-muted-foreground/30 pb-0.5">
                                        Ver payload técnico
                                      </span>
                                    </summary>
                                    <div className="mt-2 rounded-md bg-zinc-950 p-3 overflow-x-auto border border-zinc-800">
                                      <pre className="text-[10px] text-zinc-300 font-mono leading-relaxed">
                                        {JSON.stringify(event.payload, null, 2)}
                                      </pre>
                                    </div>
                                  </details>
                                </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
