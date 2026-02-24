"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { MarkdownView } from "@/components/ui/markdown-view";
import { ASSET_ICON, ASSET_LABEL, STATUS_LABEL } from "@/lib/labels";
import type { CreativeAsset } from "@/lib/types";

function FilePreview({ file }: { file: File }) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const img = imgRef.current;

    if (img) {
      img.src = objectUrl;
    }

    return () => {
      if (img && img.src === objectUrl) {
        img.removeAttribute("src");
      }
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="flex-1 min-h-0 w-full rounded-md border bg-background p-2 overflow-hidden flex items-center justify-center">
      <img
        ref={imgRef}
        alt="Vista previa"
        className="h-full w-full rounded object-contain"
        loading="lazy"
        data-filename={file.name}
      />
    </div>
  );
}

export type AuditSectionProps = {
  auditAssets: (CreativeAsset & { manual_product_name?: string })[];
  busyAction: string | null;
  filesByAsset: Record<string, File | undefined>;
  auditResults: Record<
    string,
    {
      verdict: "check" | "fail";
      explanation: string;
      confidence: number;
    }
  >;
  setFilesByAsset: React.Dispatch<
    React.SetStateAction<Record<string, File | undefined>>
  >;
  auditB: (assetId: string) => Promise<void>;
  approveB: (assetId: string) => Promise<void>;
  rejectB: (assetId: string) => Promise<void>;
  refreshAll: () => void;
  refreshing: boolean;
};

export function AuditSection({
  auditAssets,
  busyAction,
  filesByAsset,
  auditResults,
  setFilesByAsset,
  auditB,
  approveB,
  rejectB,
  refreshAll,
  refreshing,
}: AuditSectionProps) {
  if (auditAssets.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">¡Estás al día!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No hay recursos pendientes de tu auditoría en este momento. Vuelve
              más tarde cuando los creadores envíen nuevo trabajo.
            </p>
          </div>
          <Button variant="outline" onClick={refreshAll} disabled={refreshing}>
            <ShieldCheck className="mr-2 size-4" />
            Actualizar Cola
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Auditoría multimodal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sube recursos visuales para ejecutar auditorías de cumplimiento con
            IA basadas en las reglas de la marca.
          </p>
        </div>
      </div>

      <div>
        {auditAssets.map((asset) => {
          const Icon = ASSET_ICON[asset.asset_type];
          const auditBusy = busyAction === `audit-${asset.id}`;
          const approveBusy = busyAction === `approve-${asset.id}`;
          const rejectBusy = busyAction === `reject-${asset.id}`;
          const latestAudit = auditResults[asset.id];

          return (
            <div key={asset.id} className="flex flex-col mb-6">
              <div className="grid gap-6 lg:grid-cols-12 items-start h-full">
                <div className="flex flex-col space-y-6 lg:col-span-7 h-full">
                  <Card className="gap-0">
                    <CardHeader className="border-b border-muted">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            Metadatos del recurso
                          </CardTitle>
                          <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            ID: {asset.id.split("-")[0]}
                          </span>
                        </div>
                        <Badge
                          variant={
                            asset.workflow_status === "approved"
                              ? "default"
                              : asset.workflow_status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                          className="font-medium"
                        >
                          {STATUS_LABEL[asset.workflow_status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                          Tipo de Recurso
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1.5 font-normal bg-background"
                          >
                            <Icon className="size-3" />
                            {ASSET_LABEL[asset.asset_type]}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                          Producto Objetivo
                        </h4>
                        <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                          {asset.manual_product_name || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                          Brief Creativo
                        </h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {asset.brief || "Recurso sin título"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col gap-0 overflow-hidden h-fit">
                    <CardHeader className="border-b border-muted gap-0 shrink-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        Contenido generado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="p-5">
                        <MarkdownView
                          content={asset.generated_text || "Sin contenido"}
                          className="prose prose-sm dark:prose-invert max-w-none"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col gap-0 flex-1 overflow-hidden h-[400px]">
                    <CardHeader className="border-b border-muted gap-0 shrink-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        Manual de marca
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
                      <ScrollArea className="h-full">
                        <div className="p-5">
                          <MarkdownView
                            content={
                              asset.manual_markdown || "Manual no disponible"
                            }
                            className="prose prose-sm dark:prose-invert max-w-none"
                          />
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col space-y-4 lg:col-span-5 lg:sticky lg:top-6">
                  <div className="flex flex-col space-y-2">
                    <Label
                      htmlFor={`file-${asset.id}`}
                      className="text-xs font-semibold uppercase text-muted-foreground shrink-0"
                    >
                      Subir recurso para auditoría
                    </Label>
                    <div className="flex items-center rounded-md border shrink-0 bg-background">
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="cursor-pointer font-medium rounded-none rounded-l-md border-r h-9 px-4"
                      >
                        <label htmlFor={`file-${asset.id}`}>
                          Seleccionar archivo
                          <input
                            id={`file-${asset.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              setFilesByAsset((prev) => ({
                                ...prev,
                                [asset.id]: file,
                              }));
                            }}
                            className="hidden"
                          />
                        </label>
                      </Button>
                      <span className="text-sm text-foreground px-3 flex-1 truncate">
                        {filesByAsset[asset.id]
                          ? filesByAsset[asset.id]?.name
                          : ""}
                      </span>
                    </div>
                    {filesByAsset[asset.id] && (
                      <p className="text-[10px] text-muted-foreground/70">
                        Seleccionado: {filesByAsset[asset.id]?.name}
                      </p>
                    )}

                    <div className="flex flex-col mt-2 h-[400px]">
                      {filesByAsset[asset.id] ? (
                        <FilePreview file={filesByAsset[asset.id]!} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center rounded-md border bg-background p-4 text-center text-sm text-muted-foreground">
                          Sube un recurso visual para previsualizarlo aquí.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border rounded-md bg-background p-3 mt-4">
                    <Button
                      className="w-full"
                      disabled={auditBusy || !filesByAsset[asset.id]}
                      onClick={() => auditB(asset.id).catch(() => null)}
                    >
                      {auditBusy ? (
                        <>
                          <Spinner className="mr-2 size-4" />
                          Ejecutando auditoría...
                        </>
                      ) : (
                        "Ejecutar auditoría multimodal"
                      )}
                    </Button>

                    {latestAudit && (
                      <div
                        className={`w-full rounded-md border p-3 text-sm ${
                          latestAudit.verdict === "check"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-red-200 bg-red-50 text-red-800"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2 font-medium">
                          {latestAudit.verdict === "check" ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                          {latestAudit.verdict === "check"
                            ? "Cumple el manual de marca"
                            : "No cumple el manual de marca"}
                        </div>
                        <p className="text-xs leading-relaxed">
                          {latestAudit.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 border rounded-md bg-background p-3">
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={!latestAudit || rejectBusy || approveBusy}
                      onClick={() => rejectB(asset.id).catch(() => null)}
                    >
                      {rejectBusy ? <Spinner className="size-4" /> : "Rechazar"}
                    </Button>
                    <Button
                      className="w-full"
                      disabled={!latestAudit || approveBusy || rejectBusy}
                      onClick={() => approveB(asset.id).catch(() => null)}
                    >
                      {approveBusy ? <Spinner className="size-4" /> : "Aprobar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
