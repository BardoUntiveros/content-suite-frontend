import {
  AssetType,
  BrandManual,
  CreativeAsset,
  CreativeAssetJourney,
  CreativeAssetHistoryItem,
  WorkflowStatus,
  User,
} from "@/lib/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

interface ApiError {
  detail?: string;
}

interface AuditPayload {
  id: string;
  asset_id: string;
  approver_id: string;
  image_path: string;
  verdict: "check" | "fail";
  explanation: string;
  confidence: number;
  created_at: string;
}

interface GovernanceDecisionPayload {
  asset_id: string;
  workflow_status: WorkflowStatus;
  rejection_reason: string | null;
  audit?: AuditPayload | null;
}

async function request<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers = new Headers(init?.headers || {});

  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let payload: ApiError = {};
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      // noop
    }
    throw new Error(payload.detail || "Unexpected API error");
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<string> {
  const response = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response.access_token;
}

export function getCurrentUser(token: string): Promise<User> {
  return request<User>("/auth/me", undefined, token);
}

export function listManuals(token: string): Promise<{ items: BrandManual[] }> {
  return request<{ items: BrandManual[] }>("/brand-manuals", undefined, token);
}

export function createManual(
  token: string,
  payload: {
    product_name: string;
    tone: string;
    audience: string;
    extra_context: string;
  },
): Promise<BrandManual> {
  return request<BrandManual>(
    "/brand-manuals",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function generateAsset(
  token: string,
  payload: {
    manual_id: string;
    asset_type: AssetType;
    brief: string;
  },
): Promise<{ asset: CreativeAsset; rag_context: string[] }> {
  return request<{ asset: CreativeAsset; rag_context: string[] }>(
    "/creative-assets",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );
}

export function listAssets(
  token: string,
  status?: WorkflowStatus,
): Promise<{ items: CreativeAsset[] }> {
  const query = status ? `?status=${status}` : "";
  return request<{ items: CreativeAsset[] }>(
    `/creative-assets${query}`,
    undefined,
    token,
  );
}

export function listAssetsHistory(
  token: string,
  assetType?: AssetType,
): Promise<{ items: CreativeAssetHistoryItem[] }> {
  const query = assetType ? `?asset_type=${assetType}` : "";
  return request<{ items: CreativeAssetHistoryItem[] }>(
    `/creative-assets/history${query}`,
    undefined,
    token,
  );
}

export function getAssetJourney(
  token: string,
  assetId: string,
): Promise<CreativeAssetJourney> {
  return request<CreativeAssetJourney>(
    `/creative-assets/${assetId}/journey`,
    undefined,
    token,
  );
}

export function reviewByApproverA(
  token: string,
  assetId: string,
  decision: "pending_b" | "rejected",
  rejectionReason?: string,
): Promise<{
  asset_id: string;
  workflow_status: WorkflowStatus;
  rejection_reason: string | null;
}> {
  return request<{
    asset_id: string;
    workflow_status: WorkflowStatus;
    rejection_reason: string | null;
  }>(
    `/governance/creative-assets/${assetId}/review-a`,
    {
      method: "POST",
      body: JSON.stringify({
        decision,
        rejection_reason: rejectionReason || null,
      }),
    },
    token,
  );
}

export function auditByApproverB(
  token: string,
  assetId: string,
  file: File,
): Promise<GovernanceDecisionPayload> {
  const formData = new FormData();
  formData.append("file", file);

  return request<GovernanceDecisionPayload>(
    `/governance/creative-assets/${assetId}/audit-image`,
    {
      method: "POST",
      body: formData,
    },
    token,
  );
}

export function reviewByApproverB(
  token: string,
  assetId: string,
  decision: "approved" | "rejected",
): Promise<GovernanceDecisionPayload> {
  return request<GovernanceDecisionPayload>(
    `/governance/creative-assets/${assetId}/review-b`,
    {
      method: "POST",
      body: JSON.stringify({ decision }),
    },
    token,
  );
}
