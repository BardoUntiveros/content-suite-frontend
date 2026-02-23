"use client";

import { ShieldCheck } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { MarkdownView } from "@/components/ui/markdown-view";
import { ASSET_ICON, ASSET_LABEL, STATUS_LABEL } from "@/lib/labels";
import type { CreativeAsset } from "@/lib/types";

export type ReviewSectionProps = {
  reviewAssets: CreativeAsset[];
  busyAction: string | null;
  rejections: Record<string, string>;
  setRejections: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  approveA: (assetId: string) => Promise<void>;
  rejectA: (assetId: string) => Promise<void>;
  refreshAll: () => void;
  refreshing: boolean;
};

export function ReviewSection({
  reviewAssets,
  busyAction,
  rejections,
  setRejections,
  approveA,
  rejectA,
  refreshAll,
  refreshing,
}: ReviewSectionProps) {
  if (reviewAssets.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/10 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="size-8 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">¡Estás al día!</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              No hay recursos pendientes de tu revisión en este momento. Vuelve
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
            Revisión de gobernanza
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Revisa los recursos pendientes para verificar el cumplimiento de la
            marca y apruébalos o recházalos.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {reviewAssets.map((asset) => {
          const Icon = ASSET_ICON[asset.asset_type];
          const approveBusy = busyAction === `approve-${asset.id}`;
          const rejectBusy = busyAction === `reject-${asset.id}`;

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
                    Contenido generado
                  </Label>
                  <ScrollArea className="flex-1 rounded-md border bg-background p-4 min-h-0">
                    <MarkdownView
                      content={asset.generated_text}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    />
                  </ScrollArea>
                </div>

                <div className="flex flex-col space-y-4 lg:col-span-4 h-full min-h-0">
                  <div className="flex flex-col space-y-2 flex-1 min-h-0">
                    <Label
                      htmlFor={`reject-${asset.id}`}
                      className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between shrink-0"
                    >
                      <span>Comentarios de rechazo</span>
                      <span className="text-muted-foreground/50 font-normal normal-case">
                        (Requerido)
                      </span>
                    </Label>
                    <Textarea
                      id={`reject-${asset.id}`}
                      value={rejections[asset.id] || ""}
                      onChange={(event) =>
                        setRejections((prev) => ({
                          ...prev,
                          [asset.id]: event.target.value,
                        }))
                      }
                      placeholder="Proporciona comentarios accionables..."
                      className="flex-1 resize-none min-h-0"
                    />
                  </div>

                  <CardFooter className="flex flex-col gap-2 border rounded-md bg-background p-3 shrink-0">
                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={rejectBusy || approveBusy}
                      onClick={() => rejectA(asset.id).catch(() => null)}
                    >
                      {rejectBusy ? <Spinner className="size-4" /> : "Rechazar"}
                    </Button>
                    <Button
                      className="w-full"
                      disabled={approveBusy || rejectBusy}
                      onClick={() => approveA(asset.id).catch(() => null)}
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
