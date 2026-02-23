"use client";

import { Eye } from "lucide-react";

import type { BrandManual } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownView } from "@/components/ui/markdown-view";

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

type ManualDetailsDialogProps = {
  manual: BrandManual;
};

export function ManualDetailsDialog({ manual }: ManualDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 size-3.5" />
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{manual.product_name}</span>
            <Badge variant="outline">Manual de marca</Badge>
          </DialogTitle>
          <DialogDescription>
            Creado el {formatDate(manual.created_at)}. Revisa el contenido
            indexado que usa el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Tono</p>
            <p className="mt-1 font-medium">{manual.tone}</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">Publico</p>
            <p className="mt-1 font-medium">{manual.audience}</p>
          </div>
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs uppercase text-muted-foreground">
              Fecha de creacion
            </p>
            <p className="mt-1 font-medium">{formatDate(manual.created_at)}</p>
          </div>
        </div>

        <div className="rounded-md border bg-background">
          <ScrollArea className="h-[60vh]">
            <div className="p-5">
              <MarkdownView
                content={manual.manual_markdown}
                className="prose prose-sm dark:prose-invert max-w-none"
              />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
