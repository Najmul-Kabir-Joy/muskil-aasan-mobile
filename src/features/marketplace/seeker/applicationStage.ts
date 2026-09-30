import type { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/theme/tokens";
import type { SeekerApplicationStage } from "@/types/domain";

// How each prototype application stage is labelled wherever it shows (Job
// cards on Home/Saved, the Applications screen). The label always spells
// the stage out; colour only reinforces it. Event-style wording on purpose
// ("Response sent", not "Pending") — these describe what happened, not a
// final status machine.
export const APPLICATION_STAGES: Record<
  SeekerApplicationStage,
  {
    label: string;
    // The shorter wording a Job card's footer button uses.
    shortLabel: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    background: string;
    text: string;
  }
> = {
  responseSent: {
    label: "Response sent",
    shortLabel: "Responded",
    icon: "check-circle",
    background: colors.primarySoft,
    text: colors.primaryDark,
  },
  jobRequest: {
    label: "Job request received",
    shortLabel: "Job request",
    icon: "mark-email-unread",
    background: colors.secondarySoft,
    text: colors.secondaryDark,
  },
  accepted: {
    label: "Job request accepted",
    shortLabel: "Accepted",
    icon: "handshake",
    background: colors.tertiarySoft,
    text: colors.tertiaryDark,
  },
};
