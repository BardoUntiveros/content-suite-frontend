export type Role = "creator" | "approver_a" | "approver_b";

export type WorkflowStatus =
  | "pending_a"
  | "pending_b"
  | "approved"
  | "rejected";

export type AssetType = "product_description" | "video_script" | "image_prompt";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
}

export interface BrandManual {
  id: string;
  product_name: string;
  tone: string;
  audience: string;
  manual_markdown: string;
  created_by_id: string;
  created_at: string;
}

export interface CreativeAsset {
  id: string;
  manual_id: string;
  created_by_id: string;
  asset_type: AssetType;
  brief: string;
  generated_text: string;
  workflow_status: WorkflowStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  manual_markdown?: string;
}

export interface CreativeAssetHistoryItem extends CreativeAsset {
  manual_product_name: string;
  manual_markdown: string;
  latest_audit_verdict: "check" | "fail" | null;
  latest_audit_explanation: string | null;
  latest_audit_confidence: number | null;
  latest_audit_at: string | null;
}

export type JourneyEventType =
  | "asset_created"
  | "review_a_approved"
  | "review_a_rejected"
  | "audit_check"
  | "audit_fail";

export interface CreativeAssetJourneyEvent {
  id: string;
  event_type: JourneyEventType;
  from_status: WorkflowStatus | null;
  to_status: WorkflowStatus;
  note: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_role: Role | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface CreativeAssetJourney {
  asset: CreativeAssetHistoryItem;
  events: CreativeAssetJourneyEvent[];
}
