import { Badge } from "@/components/ui/badge";

const SUCCESS_STATUSES = new Set(["ACTIVE", "CONFIRMED", "COMPLETED", "APPROVED", "AVAILABLE", "VERIFIED"]);
const WARNING_STATUSES = new Set(["PENDING", "PENDING_VERIFICATION", "SUBMITTED", "DRAFT"]);
const DANGER_STATUSES = new Set(["REJECTED", "CANCELLED", "FAILED", "DISABLED", "SUSPENDED", "EXPIRED"]);
const INFO_STATUSES = new Set(["BOOKED", "MAINTENANCE"]);

export function statusTone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (SUCCESS_STATUSES.has(status)) return "success";
  if (WARNING_STATUSES.has(status)) return "warning";
  if (DANGER_STATUSES.has(status)) return "danger";
  if (INFO_STATUSES.has(status)) return "info";
  return "neutral";
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}
