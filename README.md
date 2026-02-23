## Content Suite Frontend (Next.js)

Frontend para la **App: Content Suite**. Expone las vistas de los 3 roles (Creador, Aprobador A, Aprobador B) y consume el backend FastAPI. Usa el API client de `lib/api.ts` y la sesión centralizada en `app/dashboard/dashboard-session.tsx`.

### Stack rápido

- Next.js 16 + React 19, TypeScript.
- Tailwind/shadcn UI, sonner (toasts), lucide-react (íconos).
- Auth por token JWT (persistido en localStorage vía `lib/auth`).

### Correr local

```bash
pnpm install
pnpm dev
# API por defecto: http://localhost:8000/api/v1
```

Configurable con `NEXT_PUBLIC_API_URL`.

### Roles y flujo

- **Creador** (`creator`) — Módulo II: Creative Engine.
  - Crea manuales de marca (Brand DNA) en `/dashboard/brand-manuals`.
  - Genera assets (descripción, guion, prompt) en `/dashboard/creative-assets/new` usando el manual (consulta RAG en backend).
- **Aprobador A** (`approver_a`) — Módulo III: Governance (revisión textual).
  - Revisa cola `pending_a`, decide `pending_b` o `rejected` (`lib/api.reviewByApproverA`).
- **Aprobador B** (`approver_b`) — Módulo III: Multimodal Audit.
  - Audita cola `pending_b`, sube imagen y obtiene veredicto IA (`lib/api.auditByApproverB`).
  - Aprueba/rechaza (`lib/api.reviewByApproverB`).

Estados de workflow (`lib/types.WorkflowStatus`): `pending_a` → `pending_b` → `approved` / `rejected`.

### Módulos UI principales

- **Módulo I: Brand DNA Architect**
  - Página: `app/dashboard/brand-manuals/page.tsx` (lista/genera manuales). Consume `listManuals`, `createManual`.
  - Componentes: `brand-manuals/components` (tabla, diálogo creación).
- **Módulo II: Creative Engine**
  - Página: `app/dashboard/creative-assets/new/page.tsx` (formulario de brief y tipo de asset). Llama `generateAsset` con `manual_id` seleccionado.
  - Tipos de asset (`lib/types.AssetType`): `product_description`, `video_script`, `image_prompt`. Labels/íconos en `lib/labels.ts`.
- **Módulo III: Governance & Multimodal Audit**
  - Lista unificada: `app/dashboard/creative-assets/page.tsx` (histórico + CTA crear para creadores).
  - Detalle + trazabilidad: `app/dashboard/creative-assets/[assetId]/page.tsx` muestra timeline (journey), payload técnico y contenido generado.
  - Revisión A: flujo en `creative-assets/components/creative-assets-table` (botones según rol) + API `reviewByApproverA`.
  - Auditoría B: `creative-assets/[assetId]/audit/page.tsx` + `audit-section.tsx` (subida de archivo, veredictos check/fail, aprobar/rechazar).
- **Módulo IV: Observabilidad**
  - La vista de journey (línea de tiempo) expone eventos `CreativeAssetJourneyEvent` (quién, cuándo, payload).

### Sesión, RBAC y navegación

- `app/dashboard/dashboard-session.tsx`: obtiene `auth/me`, guarda token, expone `pendingCount` por rol (creador no tiene cola; A ve `pending_a`; B ve `pending_b`).
- `app/dashboard/role-guard.tsx`: protege rutas específicas según `Role`.
- `app/dashboard/layout.tsx` + `app/dashboard/app-sidebar.tsx`: shell común, badge de rol y logout.
- Ruta raíz `app/page.tsx`: redirige a `/dashboard` o `/login` según token almacenado.

### API client (`lib/api.ts`)

- Auth: `login`, `getCurrentUser`.
- Brand manuals: `listManuals`, `createManual`.
- Assets: `generateAsset`, `listAssets`, `listAssetsHistory`, `getAssetJourney`.
- Governance: `reviewByApproverA` (pasa a `pending_b` o rechaza), `auditByApproverB` (sube archivo FormData), `reviewByApproverB` (aprueba/rechaza final).

### Datos y tipos (`lib/types.ts`)

- Roles: `creator`, `approver_a`, `approver_b`.
- AssetType y WorkflowStatus (ver arriba).
- Estructuras: `BrandManual`, `CreativeAsset`, `CreativeAssetHistoryItem` (incluye últimos resultados de auditoría), `CreativeAssetJourneyEvent` (para timeline).

### UX por rol

- **Creador**: crea manuales, genera assets con contexto recuperado; ve histórico y trazabilidad.
- **Aprobador A**: ve cola `pending_a`, decide si pasa a auditoría o rechaza con motivo.
- **Aprobador B**: sube evidencia visual para auditoría multimodal, recibe veredicto IA y cierra con aprobación/rechazo.

### Notas de despliegue

- Configura `NEXT_PUBLIC_API_URL` para apuntar al backend desplegado (FastAPI con RAG y Langfuse). Sin variable, usa `http://localhost:8000/api/v1`.
- Ejecuta `pnpm build` y `pnpm start` para producción.
