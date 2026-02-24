"use client";

import Link from "next/link";

import { ASSET_LABEL, STATUS_LABEL } from "@/lib/labels";
import type { CreativeAssetHistoryItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpenText, Route } from "lucide-react";

export type CreativeAssetsTableProps = {
  assets: CreativeAssetHistoryItem[];
  isApproverA: boolean;
  isApproverB: boolean;
};

export function CreativeAssetsTable({
  assets,
  isApproverA,
  isApproverB,
}: CreativeAssetsTableProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background overflow-x-auto min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Última actualización</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <BookOpenText className="size-8 opacity-40" />
                  <p className="text-sm font-medium">
                    No hay recursos disponibles
                  </p>
                  <p className="text-xs">Genera un recurso para verlo aquí.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {assets.map((asset) => {
            const showReview =
              isApproverA && asset.workflow_status === "pending_a";
            const showAudit =
              isApproverB && asset.workflow_status === "pending_b";

            return (
              <TableRow key={asset.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {ASSET_LABEL[asset.asset_type]}
                </TableCell>
                <TableCell
                  className="text-muted-foreground max-w-[200px] truncate"
                  title={asset.manual_product_name}
                >
                  {asset.manual_product_name}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <Badge variant="secondary" className="shadow-none">
                    {STATUS_LABEL[asset.workflow_status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatDate(asset.updated_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Link href={`/dashboard/creative-assets/${asset.id}`}>
                        <Route className="size-3.5" />
                        <span>Ver trazabilidad</span>
                      </Link>
                    </Button>

                    {showReview ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link
                          href={`/dashboard/creative-assets/${asset.id}/review`}
                        >
                          Revisar
                        </Link>
                      </Button>
                    ) : null}

                    {showAudit ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link
                          href={`/dashboard/creative-assets/${asset.id}/audit`}
                        >
                          Auditar
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}
