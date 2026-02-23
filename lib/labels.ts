import { FileText, Image as ImageIcon, Video } from "lucide-react";
import type { AssetType, WorkflowStatus } from "@/lib/types";

export const ASSET_LABEL: Record<AssetType, string> = {
  product_description: "Descripción de producto",
  video_script: "Guion de video",
  image_prompt: "Prompt de imagen",
};

export const ASSET_ICON: Record<AssetType, React.ElementType> = {
  product_description: FileText,
  video_script: Video,
  image_prompt: ImageIcon,
};

export const STATUS_LABEL: Record<WorkflowStatus, string> = {
  pending_a: "Pendiente revisión",
  pending_b: "Pendiente auditoría",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export const USER_ROLE_LABEL: Record<string, string> = {
  creator: "Creador",
  approver_a: "Aprobador A",
  approver_b: "Aprobador B",
};
