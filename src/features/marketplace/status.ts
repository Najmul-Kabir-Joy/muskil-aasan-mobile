import type { TaskStatus, VerificationStatus } from "@/types/domain";

// Prototype/mock domain mapping — not an approved product rule. See
// docs/engineering/domain-and-terminology.md.
export function statusTone(status: TaskStatus) {
  if (status === "completed") return "success";
  if (status === "cancelled" || status === "disputed") return "danger";
  if (status === "completion requested" || status === "hired") return "warning";
  return "neutral";
}

// Prototype/mock domain mapping — not an approved product rule. See
// docs/engineering/domain-and-terminology.md.
export function verificationLabel(status: VerificationStatus) {
  if (status === "verified") return "Verified";
  if (status === "pending") return "Pending";
  return "Unverified";
}
