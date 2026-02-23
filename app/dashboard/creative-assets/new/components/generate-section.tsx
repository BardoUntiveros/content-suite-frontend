import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { MarkdownView } from "@/components/ui/markdown-view";
import { AssetType, BrandManual } from "@/lib/types";
import { ASSET_ICON, ASSET_LABEL } from "@/lib/labels";
import React from "react";

export type CreativeForm = {
  manual_id: string;
  asset_type: AssetType;
  brief: string;
};

export type GenerateSectionProps = {
  manuals: BrandManual[];
  creativeForm: CreativeForm;
  setCreativeForm: (form: CreativeForm) => void;
  selectedManualDoc?: BrandManual;
  setSelectedManual?: (value: string) => void;
  busyAction: string | null;
  onCreateAsset?: () => void | Promise<void>;
};

export function GenerateSection({
  manuals,
  creativeForm,
  setCreativeForm,
  selectedManualDoc,
  setSelectedManual,
  busyAction,
  onCreateAsset,
}: GenerateSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Generar recursos creativos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea nuevos assets con contexto de marca y visualiza el manual que se
          usará como referencia.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:h-[calc(100vh-11rem)]">
        <div className="lg:col-span-4 min-h-0">
          <Card className="shadow-sm border-muted/60 h-full flex flex-col gap-0">
            <CardHeader className="bg-muted/10 border-b border-muted/50">
              <CardTitle className="text-lg">Motor creativo</CardTitle>
              <CardDescription>
                Genera nuevos recursos basados en el contexto seleccionado.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-5 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="manual-source"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Manual de Marca
                </Label>
                <Select
                  value={creativeForm.manual_id}
                  onValueChange={(value) => {
                    setCreativeForm({ ...creativeForm, manual_id: value });
                    setSelectedManual?.(value);
                  }}
                >
                  <SelectTrigger
                    id="manual-source"
                    className="bg-background border-primary/20 hover:border-primary/50 transition-colors h-11"
                  >
                    <SelectValue placeholder="Elegir manual de marca..." />
                  </SelectTrigger>
                  <SelectContent>
                    {manuals.map((manual) => (
                      <SelectItem key={manual.id} value={manual.id}>
                        {manual.product_name}
                      </SelectItem>
                    ))}
                    {manuals.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground italic text-center">
                        No hay manuales disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="asset-type"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Tipo de Recurso
                </Label>
                <Select
                  value={creativeForm.asset_type}
                  onValueChange={(value: AssetType) =>
                    setCreativeForm({ ...creativeForm, asset_type: value })
                  }
                >
                  <SelectTrigger id="asset-type" className="bg-muted/30">
                    <SelectValue placeholder="Elegir tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_LABEL).map(([value, label]) => {
                      const Icon = ASSET_ICON[value as AssetType];
                      return (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <Icon className="size-4 text-muted-foreground" />
                            {label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="creative-brief"
                  className="text-xs font-semibold uppercase text-muted-foreground"
                >
                  Brief Creativo (Instrucciones)
                </Label>
                <Textarea
                  id="creative-brief"
                  rows={6}
                  value={creativeForm.brief}
                  onChange={(event) =>
                    setCreativeForm({
                      ...creativeForm,
                      brief: event.target.value,
                    })
                  }
                  className="bg-muted/30 resize-none"
                  placeholder="Describe qué deseas que la IA genere..."
                />
              </div>
            </CardContent>
            <CardContent className="p-5 pt-0">
              <Button
                onClick={onCreateAsset}
                disabled={
                  busyAction === "create-asset" || !creativeForm.manual_id
                }
                className="w-full h-11"
              >
                {busyAction === "create-asset" ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Generando recurso...
                  </>
                ) : (
                  "Generar recurso con IA"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 min-h-0">
          <Card className="h-full shadow-sm border-muted/60 flex flex-col gap-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Contenido del manual</span>
                {selectedManualDoc && (
                  <Badge
                    variant="outline"
                    className="font-normal bg-background"
                  >
                    {selectedManualDoc.product_name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Este es el conocimiento exacto que la IA leerá para asegurar que
                el recurso cumpla con tu marca.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full w-full bg-muted/5">
                {selectedManualDoc ? (
                  <div className="p-6 md:p-8 prose prose-sm dark:prose-invert max-w-none prose-h1:text-xl prose-h2:text-lg prose-h3:text-base w-full overflow-hidden wrap-break-word">
                    <MarkdownView
                      content={selectedManualDoc.manual_markdown}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground space-y-4">
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted/50 border border-muted">
                      <ASSET_ICON.product_description className="size-8 text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-foreground/80">
                        Selecciona un manual para ver su contenido
                      </p>
                      <p className="text-sm text-muted-foreground">
                        El texto del manual aparecerá aquí para que tengas
                        contexto.
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
