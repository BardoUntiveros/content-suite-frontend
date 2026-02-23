"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type CreateManualPayload = {
  product_name: string;
  tone: string;
  audience: string;
  extra_context: string;
};

type CreateManualDialogProps = {
  busy: boolean;
  onCreateManual: (payload: CreateManualPayload) => Promise<void>;
};

const INITIAL_FORM: CreateManualPayload = {
  product_name: "",
  tone: "",
  audience: "",
  extra_context: "",
};

export function CreateManualDialog({
  busy,
  onCreateManual,
}: CreateManualDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateManualPayload>(INITIAL_FORM);

  async function handleSubmit() {
    await onCreateManual(form);
    setOpen(false);
    setForm(INITIAL_FORM);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Crear manual de marca
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear nuevo manual de marca</DialogTitle>
          <DialogDescription>
            Define el contexto de marca para que el sistema lo indexe y lo use
            en la generacion de contenido.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="manual-product-name">Nombre del producto</Label>
            <Input
              id="manual-product-name"
              value={form.product_name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  product_name: event.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-tone">Tono de voz</Label>
            <Input
              id="manual-tone"
              value={form.tone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tone: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manual-audience">Publico objetivo</Label>
            <Input
              id="manual-audience"
              value={form.audience}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, audience: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="manual-extra-context">Contexto extra y guias</Label>
            <Textarea
              id="manual-extra-context"
              rows={4}
              className="resize-none"
              value={form.extra_context}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  extra_context: event.target.value,
                }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit().catch(() => null)}
            disabled={
              busy ||
              !form.product_name.trim() ||
              !form.tone.trim() ||
              !form.audience.trim()
            }
          >
            {busy ? (
              <>
                <Spinner className="mr-2 size-4" />
                Generando...
              </>
            ) : (
              "Generar manual"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
