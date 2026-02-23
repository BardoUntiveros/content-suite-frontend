import { BookOpenText } from "lucide-react";

import type { BrandManual } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManualDetailsDialog } from "@/app/dashboard/brand-manuals/components/manual-details-dialog";

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

type ManualsTableProps = {
  manuals: BrandManual[];
};

export function ManualsTable({ manuals }: ManualsTableProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Tono</TableHead>
            <TableHead>Público</TableHead>
            <TableHead>Fecha de creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manuals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <BookOpenText className="size-8 opacity-40" />
                  <p className="text-sm font-medium">
                    No hay manuales disponibles
                  </p>
                  <p className="text-xs">
                    Crea un manual para empezar a generar contenido.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : null}

          {manuals.map((manual) => (
            <TableRow key={manual.id}>
              <TableCell className="font-medium">
                {manual.product_name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {manual.tone}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {manual.audience}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(manual.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <ManualDetailsDialog manual={manual} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
