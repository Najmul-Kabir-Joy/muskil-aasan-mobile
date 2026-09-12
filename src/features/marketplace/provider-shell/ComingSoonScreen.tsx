import type { Edges } from "react-native-safe-area-context";
import { AppHeader, EmptyState, ScrollScreen } from "@/shared/components/ui";

/**
 * Generic placeholder for Provider drawer destinations that don't have a
 * finalized screen yet (Saved Jobs, Identity Setup, Job Interests, Personal
 * Information, Location/Area, Notifications, Terms & Conditions, Privacy
 * Policy). One reusable screen parameterized by title, rather than inventing
 * a full feature (or a route file) per destination — see
 * `app/(poster)/coming-soon.tsx`.
 */
export function ComingSoonScreen({ title, edges }: { title: string; edges?: Edges }) {
  return (
    <ScrollScreen edges={edges}>
      <AppHeader title={title} />
      <EmptyState title="Coming soon" body={`${title} isn't available yet in this prototype.`} />
    </ScrollScreen>
  );
}
