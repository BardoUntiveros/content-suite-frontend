import { Hexagon, ShieldCheck, Sparkles, Zap } from "lucide-react";
export function BrandingPanel() {
  return (
    <div className="relative hidden md:flex w-1/2 flex-col justify-between bg-zinc-950 p-12 text-zinc-50 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>

      <div className="relative z-10 flex items-center gap-2 text-xl font-bold">
        <Hexagon className="size-8 text-primary fill-white" />
        <span>Content Suite</span>
      </div>

      <div className="relative z-10 space-y-6 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          La plataforma inteligente para el ciclo de vida del contenido.
        </h1>
        <p className="text-zinc-400 text-lg">
          Unifica las guías de tu marca, automatiza la creación de contenido y
          asegura el cumplimiento con auditoría de IA multimodal.
        </p>

        <div className="space-y-4 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
              <Sparkles className="size-5 text-zinc-300" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Generación de Contenido con IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
              <ShieldCheck className="size-5 text-zinc-300" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Gobernanza de Marca Automatizada
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800">
              <Zap className="size-5 text-zinc-300" />
            </div>
            <p className="text-sm font-medium text-zinc-300">
              Flujos de Trabajo Colaborativos
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-sm text-zinc-500">
        {new Date().getFullYear()} Content Suite. Todos los derechos reservados.
      </div>
    </div>
  );
}
