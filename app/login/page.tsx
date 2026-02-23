"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getStoredToken, setStoredToken } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error";
import { login } from "@/lib/api";
import { BrandingPanel } from "./components/branding-panel";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setCheckingToken(false);
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusy(true);
      const token = await login(email, password);
      setStoredToken(token);
      toast.success("Bienvenido de nuevo");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (checkingToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Inicializando espacio de trabajo...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <BrandingPanel />
      <LoginForm
        email={email}
        password={password}
        busy={busy}
        onChangeEmail={setEmail}
        onChangePassword={setPassword}
        onSubmit={handleLogin}
      />
    </main>
  );
}
