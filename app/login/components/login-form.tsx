import { FormEvent } from "react";
import { Hexagon } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  email: string;
  password: string;
  busy: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
  email,
  password,
  busy,
  onChangeEmail,
  onChangePassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex md:hidden items-center justify-center gap-2 text-xl font-bold mb-6">
            <Hexagon className="size-8 text-primary fill-primary/20" />
            <span>Content Suite</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Iniciar sesión</h2>
          <p className="text-muted-foreground">
            Ingresa tus credenciales para acceder a Content Suite.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(event) => onChangeEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => onChangePassword(event.target.value)}
              autoComplete="current-password"
              required
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner className="mr-2 size-4" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
