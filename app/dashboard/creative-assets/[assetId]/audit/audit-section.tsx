"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  auditAssets: CreativeAsset[];
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
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Auditoría multimodal
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sube recursos visuales para ejecutar auditorías de cumplimiento con
            IA basadas en las reglas de la marca.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {auditAssets.map((asset) => {
          const Icon = ASSET_ICON[asset.asset_type];
          const auditBusy = busyAction === `audit-${asset.id}`;
          const approveBusy = busyAction === `approve-${asset.id}`;
          const rejectBusy = busyAction === `reject-${asset.id}`;
          const latestAudit = auditResults[asset.id];

          return (
            <Card
              key={asset.id}
              className="shadow-sm border-muted/60 h-full flex flex-col overflow-hidden"
            >
              <CardHeader className="space-y-3 pb-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 font-normal bg-background"
                  >
                    <Icon className="size-3" />
                    {ASSET_LABEL[asset.asset_type]}
                  </Badge>
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
                <div className="space-y-1">
                  <CardTitle className="text-base" title={asset.brief}>
                    {asset.brief || "Recurso sin título"}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono text-muted-foreground/70">
                    ID: {asset.id.split("-")[0]}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 border-t bg-muted/5 p-5 lg:grid-cols-12 flex-1 min-h-0">
                <div className="flex flex-col space-y-2 lg:col-span-8 h-full min-h-0">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground shrink-0">
                    Manual de marca
                  </Label>
                  <ScrollArea className="flex-1 rounded-md border bg-background p-4 min-h-0">
                    <MarkdownView
                      content={asset.manual_markdown || "Manual no disponible"}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    />
                  </ScrollArea>
                </div>

                <div className="flex flex-col space-y-4 lg:col-span-4 h-full min-h-0">
                  <div className="flex flex-col space-y-2 flex-1 min-h-0">
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
                      <p className="text-[10px] text-muted-foreground/70 shrink-0">
                        Seleccionado: {filesByAsset[asset.id]?.name}
                      </p>
                    )}

                    <div className="flex-1 min-h-0 flex flex-col mt-2">
                      {filesByAsset[asset.id] ? (
                        <FilePreview file={filesByAsset[asset.id]!} />
                      ) : (
                        <div className="flex-1 min-h-0 w-full flex items-center justify-center rounded-md border bg-background p-4 text-center text-sm text-muted-foreground">
                          Sube un recurso visual para previsualizarlo aquí.
                        </div>
                      )}
                    </div>
                  </div>

                  <CardFooter className="flex flex-col gap-2 border rounded-md bg-background p-3 shrink-0">
                    <Button
                      className="w-full"
                      disabled={auditBusy || !filesByAsset[asset.id]}
                      onClick={() => auditB(asset.id).catch(() => null)}
                    >
                      {auditBusy ? (
                        <>
                          <Spinner className="mr-2 size-4" />
                          Ejecutando Auditoría...
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
                  </CardFooter>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
