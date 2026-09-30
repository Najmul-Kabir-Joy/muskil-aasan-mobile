import { act, fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import type { ReactElement } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SeekerActivityProvider } from "@/features/marketplace/seeker/SeekerActivityContext";
import { SeekerApplicationsScreen } from "@/features/marketplace/seeker/SeekerApplicationsScreen";
import { SeekerHomeScreen } from "@/features/marketplace/seeker/SeekerHomeScreen";
import { SeekerSavedScreen } from "@/features/marketplace/seeker/SeekerSavedScreen";
import { getSeekerCompletedJobs, seekerApplications, seekerFeedJobs } from "@/data/mock";
import type { SeekerApplication, Task } from "@/types/domain";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function makeJob(overrides: Partial<Task>): Task {
  return {
    id: "job",
    title: "Fix a leaking kitchen tap",
    category: "Plumbing",
    budget: "৳500",
    area: "Mirpur 1",
    timing: "Today",
    status: "open",
    urgent: true,
    offerCount: 0,
    description: "The kitchen tap drips all day.",
    postedBy: { name: "Jasim Uddin", area: "Mirpur 1" },
    postedAgo: "3 hours ago",
    ...overrides,
  };
}

const TAP = makeJob({ id: "tap" });
const MENU = makeJob({
  id: "menu",
  title: "Design a one-page menu card",
  category: "Design",
  budget: "৳1,800",
  area: "Remote",
  remote: true,
  urgent: false,
  timing: "Within 3 days",
  description: "Twelve items with prices and our logo.",
  postedBy: { name: "Arman Hossain", area: "Banani" },
  postedAgo: "yesterday",
});

// The Seeker tabs share one provider in the real shell (the (worker)
// layout), so rendering several screens under one provider is the same
// wiring the app uses.
function renderSeeker(
  element: ReactElement,
  {
    savedJobs = [],
    applications = [],
  }: { savedJobs?: Task[]; applications?: SeekerApplication[] } = {},
) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <SeekerActivityProvider initialSavedJobs={savedJobs} initialApplications={applications}>
        {element}
      </SeekerActivityProvider>
    </SafeAreaProvider>,
  );
}

// The only Seeker-facing words that would signal a bid, price offer,
// payment or earnings flow we haven't built.
const FORBIDDEN_COPY =
  /\boffers?\b|\bbid|your price|propos|estimat|earnings|wallet|payment|escrow|withdraw|hire|verified|trust score/i;

describe("Seeker Home", () => {
  let push: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });
  });

  it("renders the feed of Jobs with what a Seeker needs to decide", async () => {
    const { getByText, getAllByText } = await renderSeeker(
      <SeekerHomeScreen jobs={[TAP, MENU]} userName="Nadia Rahman" />,
    );

    expect(getByText("Hi, Nadia")).toBeTruthy();
    expect(getByText("Find jobs you can help with")).toBeTruthy();
    expect(getByText(TAP.title)).toBeTruthy();
    expect(getByText(MENU.title)).toBeTruthy();
    // Category, budget, place, timing, and the Provider's public basics.
    expect(getAllByText("Plumbing").length).toBeGreaterThan(0);
    expect(getByText("৳500")).toBeTruthy();
    expect(getByText("Mirpur 1")).toBeTruthy();
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Jasim Uddin")).toBeTruthy();
    expect(getByText("Posted 3 hours ago")).toBeTruthy();
    expect(getByText("2 jobs")).toBeTruthy();
  });

  it("renders the default feed from the shared mock data", async () => {
    const { getByText } = await renderSeeker(<SeekerHomeScreen />);

    for (const job of seekerFeedJobs) {
      expect(getByText(job.title)).toBeTruthy();
    }
  });

  it("spells out Remote jobs instead of relying on the icon", async () => {
    const anywhere = makeJob({ id: "typing", area: "Anywhere in BD", remote: true });
    const { getByText } = await renderSeeker(<SeekerHomeScreen jobs={[anywhere]} />);

    expect(getByText("Remote · Anywhere in BD")).toBeTruthy();
  });

  it("never shows Provider contact details, bids, prices to enter, payments or earnings", async () => {
    const { queryByText, toJSON } = await renderSeeker(<SeekerHomeScreen />);

    expect(queryByText(FORBIDDEN_COPY)).toBeNull();
    expect(queryByText(/\+880|phone/i)).toBeNull();
    expect(JSON.stringify(toJSON())).not.toMatch(/Send mock offer|Offer sent/);
  });

  it("has no screen-level Job Provider / Job Seeker switch — that lives in the drawer", async () => {
    const { queryByText, queryByRole } = await renderSeeker(<SeekerHomeScreen />);

    expect(queryByText(/poster mode/i)).toBeNull();
    expect(queryByRole("button", { name: /job provider/i })).toBeNull();
    expect(queryByRole("button", { name: /switch/i })).toBeNull();
  });

  it("filters by Remote and by category, one at a time, and tapping again clears it", async () => {
    const { getByRole, queryByText, getByText } = await renderSeeker(
      <SeekerHomeScreen jobs={[TAP, MENU]} />,
    );

    await fireEvent.press(getByRole("button", { name: "Remote" }));
    expect(queryByText(TAP.title)).toBeNull();
    expect(getByText(MENU.title)).toBeTruthy();
    expect(getByRole("button", { name: "Remote" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );

    await fireEvent.press(getByRole("button", { name: "Plumbing" }));
    expect(getByText(TAP.title)).toBeTruthy();
    expect(queryByText(MENU.title)).toBeNull();

    await fireEvent.press(getByRole("button", { name: "Plumbing" }));
    expect(getByText(TAP.title)).toBeTruthy();
    expect(getByText(MENU.title)).toBeTruthy();
  });

  it("offers only categories that have jobs, from the app-wide list", async () => {
    const { getByRole, queryByRole } = await renderSeeker(<SeekerHomeScreen jobs={[TAP, MENU]} />);

    expect(getByRole("button", { name: "Design" })).toBeTruthy();
    expect(getByRole("button", { name: "Plumbing" })).toBeTruthy();
    expect(queryByRole("button", { name: "Cooking" })).toBeNull();
    // No invented location precision.
    expect(queryByRole("button", { name: /nearby/i })).toBeNull();
  });

  it("searches Jobs, and shows a way back when nothing matches", async () => {
    const { getByLabelText, getByText, queryByText, getByRole } = await renderSeeker(
      <SeekerHomeScreen jobs={[TAP, MENU]} />,
    );

    await fireEvent.changeText(getByLabelText("Search jobs"), "menu card");
    expect(getByText(MENU.title)).toBeTruthy();
    expect(queryByText(TAP.title)).toBeNull();

    await fireEvent.changeText(getByLabelText("Search jobs"), "piano lessons");
    expect(getByText("No jobs match")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Show all jobs" }));
    expect(getByText(TAP.title)).toBeTruthy();
    expect(getByText(MENU.title)).toBeTruthy();
  });

  it("shows an empty feed state when there are no jobs at all", async () => {
    const { getByText } = await renderSeeker(<SeekerHomeScreen jobs={[]} />);

    expect(getByText("No jobs right now")).toBeTruthy();
  });

  it("shows a waiting job request at the top and links to Applications", async () => {
    const { getByText, getByRole } = await renderSeeker(<SeekerHomeScreen jobs={[TAP]} />, {
      applications: seekerApplications,
    });

    expect(getByText("You have a job request")).toBeTruthy();
    expect(getByText(/Shirin Akter chose you/)).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Review job request" }));
    expect(push).toHaveBeenCalledWith("/(worker)/applications");
  });

  it("shows no job request banner when none is waiting", async () => {
    const { queryByText } = await renderSeeker(<SeekerHomeScreen jobs={[TAP]} />);

    expect(queryByText("You have a job request")).toBeNull();
  });

  it("makes the saved state obvious on the card", async () => {
    const { getByRole } = await renderSeeker(<SeekerHomeScreen jobs={[TAP]} />);

    await fireEvent.press(getByRole("button", { name: `Save ${TAP.title}` }));

    const saved = getByRole("button", { name: `Remove ${TAP.title} from Saved` });
    expect(saved.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
  });

  it("long titles, descriptions, areas and budgets still render (wrapping, not overflowing)", async () => {
    const long = makeJob({
      id: "long",
      title:
        "Weekly English conversation practice for a Class 10 student preparing for O-level speaking exams and presentations",
      description: "A very long description. ".repeat(20),
      area: "Old Dhaka (Puran Dhaka) → Bashundhara R/A",
      budget: "৳1,25,000/mo",
      postedBy: { name: "Mohammad Abdullah Al Mamun Chowdhury", area: "Bashundhara R/A" },
    });
    const { getByText } = await renderSeeker(<SeekerHomeScreen jobs={[long]} />);

    // Titles and descriptions clamp to a few lines on the card; the full
    // text is in the job sheet.
    expect(getByText(long.title).props.numberOfLines).toBe(3);
    expect(getByText(long.description).props.numberOfLines).toBe(2);
    expect(getByText(long.area)).toBeTruthy();
    expect(getByText(long.budget)).toBeTruthy();
    expect(getByText("Mohammad Abdullah Al Mamun Chowdhury").props.numberOfLines).toBe(1);
  });
});

describe("Responding to a Job", () => {
  let push: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });
  });

  it("opens the Job with its full description and one private message field — no price, bid or contact fields", async () => {
    const { getByRole, getByLabelText, getByText, queryByLabelText, queryByText } =
      await renderSeeker(<SeekerHomeScreen jobs={[TAP]} />);

    await fireEvent.press(getByRole("button", { name: `Respond to ${TAP.title}` }));

    expect(getByText("Job details")).toBeTruthy();
    expect(getByLabelText("Your response")).toBeTruthy();
    expect(getByText("Only Jasim will see your response.")).toBeTruthy();
    expect(queryByLabelText(/price|amount|budget|phone|bid/i)).toBeNull();
    expect(queryByText(FORBIDDEN_COPY)).toBeNull();
  });

  it("can't send an empty response", async () => {
    const { getByRole } = await renderSeeker(<SeekerHomeScreen jobs={[TAP]} />);

    await fireEvent.press(getByRole("button", { name: `Respond to ${TAP.title}` }));

    expect(getByRole("button", { name: "Send response" }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("sending a Response confirms it, marks the card, and adds it to Applications", async () => {
    const { getByRole, getByLabelText, getByText } = await renderSeeker(
      <>
        <SeekerHomeScreen jobs={[TAP]} />
        <SeekerApplicationsScreen completedJobs={[]} />
      </>,
    );

    await fireEvent.press(getByRole("button", { name: `Respond to ${TAP.title}` }));
    await fireEvent.changeText(getByLabelText("Your response"), "I can come this evening.");
    await fireEvent.press(getByRole("button", { name: "Send response" }));

    expect(getByText("Your response was sent")).toBeTruthy();
    expect(getByText("Only Jasim can see it. You can follow it in Applications.")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "View Applications" }));
    expect(push).toHaveBeenCalledWith("/(worker)/applications");

    // The card now shows the stage instead of Respond…
    expect(getByRole("button", { name: "Response sent. View in Applications" })).toBeTruthy();
    // …and Applications lists it with the message.
    expect(getByText("Responses sent")).toBeTruthy();
    expect(getByText("I can come this evening.")).toBeTruthy();
  });

  it("opening a Job you already responded to shows what you sent, not a new form", async () => {
    const { getByRole, getByText, queryByLabelText } = await renderSeeker(
      <SeekerHomeScreen jobs={[TAP]} />,
      {
        applications: [
          {
            id: "a",
            job: TAP,
            message: "I have a spare washer.",
            sentAgo: "2 hours ago",
            stage: "responseSent",
          },
        ],
      },
    );

    await fireEvent.press(getByRole("button", { name: `${TAP.title}. View job details` }));

    expect(getByText("I have a spare washer.")).toBeTruthy();
    expect(getByText("Only Jasim can see this · Sent 2 hours ago")).toBeTruthy();
    expect(queryByLabelText("Your response")).toBeNull();
    expect(getByRole("button", { name: "View in Applications" })).toBeTruthy();
  });
});

describe("Saved", () => {
  let push: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });
  });

  it("shows a helpful empty state that leads back to Home", async () => {
    const { getByText, getByRole } = await renderSeeker(<SeekerSavedScreen />);

    expect(getByText("No saved jobs yet")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Browse jobs" }));
    expect(push).toHaveBeenCalledWith("/(worker)");
  });

  it("Save on Home shows the Job in Saved, most recently saved first", async () => {
    const { getByRole, getByText, getAllByText } = await renderSeeker(
      <>
        <SeekerHomeScreen jobs={[TAP, MENU]} />
        <SeekerSavedScreen />
      </>,
    );

    expect(getByText("No saved jobs yet")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: `Save ${TAP.title}` }));
    await fireEvent.press(getByRole("button", { name: `Save ${MENU.title}` }));

    expect(getByText("2 saved jobs")).toBeTruthy();
    // Each saved job now appears twice: on Home and in Saved.
    expect(getAllByText(TAP.title)).toHaveLength(2);
    expect(getAllByText(MENU.title)).toHaveLength(2);
  });

  it("lists multiple saved Jobs, and unsaving removes one", async () => {
    const { getByRole, getByText, queryByText } = await renderSeeker(<SeekerSavedScreen />, {
      savedJobs: [MENU, TAP],
    });

    expect(getByText("2 saved jobs")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: `Remove ${TAP.title} from Saved` }));

    expect(queryByText(TAP.title)).toBeNull();
    expect(getByText(MENU.title)).toBeTruthy();
    expect(getByText("1 saved job")).toBeTruthy();
  });

  it("unsaving the last Job shows the empty state", async () => {
    const { getByRole, getByText } = await renderSeeker(<SeekerSavedScreen />, {
      savedJobs: [TAP],
    });

    await fireEvent.press(getByRole("button", { name: `Remove ${TAP.title} from Saved` }));

    expect(getByText("No saved jobs yet")).toBeTruthy();
  });

  it("can Respond from Saved, too", async () => {
    const { getByRole, getByLabelText } = await renderSeeker(<SeekerSavedScreen />, {
      savedJobs: [TAP],
    });

    await fireEvent.press(getByRole("button", { name: `Respond to ${TAP.title}` }));
    expect(getByLabelText("Your response")).toBeTruthy();
  });
});

describe("Applications", () => {
  let push: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });
  });

  it("groups Active applications by what needs the Seeker first", async () => {
    const { getByText, getAllByRole } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={[]} />,
      { applications: seekerApplications },
    );

    const headers = getAllByRole("header").map((node) => node.props.children);
    expect(headers).toEqual(["Applications", "Job requests", "Accepted", "Responses sent"]);
    expect(getByText("Waiting for your answer")).toBeTruthy();
    expect(getByText("1 waiting for you")).toBeTruthy();
  });

  it("shows each known state, spelled out rather than colour-only", async () => {
    const { getByText } = await renderSeeker(<SeekerApplicationsScreen completedJobs={[]} />, {
      applications: seekerApplications,
    });

    expect(getByText("Job request received")).toBeTruthy();
    expect(getByText("Job request accepted")).toBeTruthy();
    expect(getByText("Response sent")).toBeTruthy();
    expect(getByText("You accepted Rafiq's job request.")).toBeTruthy();
    expect(getByText("Only Farzana can see this · Sent 2 hours ago")).toBeTruthy();
  });

  it("accepting a job request asks to confirm, then moves it to Accepted", async () => {
    const alert = jest.spyOn(Alert, "alert");
    const { getByRole, getByText, queryByText } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={[]} />,
      { applications: seekerApplications },
    );

    await fireEvent.press(
      getByRole("button", {
        name: "Accept job request for Repair a table fan and two switchboards",
      }),
    );

    expect(alert).toHaveBeenCalledWith(
      "Accept this job request?",
      expect.stringContaining("Shirin Akter"),
      expect.any(Array),
    );
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    const accept = buttons.find((button) => button.text === "Accept");
    await act(async () => accept?.onPress?.());

    expect(queryByText("Job requests")).toBeNull();
    expect(getByText("You accepted Shirin's job request.")).toBeTruthy();
    alert.mockRestore();
  });

  it("choosing Not now leaves the job request waiting", async () => {
    const alert = jest.spyOn(Alert, "alert");
    const { getByRole, getByText } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={[]} />,
      { applications: seekerApplications },
    );

    await fireEvent.press(
      getByRole("button", {
        name: "Accept job request for Repair a table fan and two switchboards",
      }),
    );
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    expect(buttons.map((button) => button.text)).toEqual(["Not now", "Accept"]);

    expect(getByText("Job requests")).toBeTruthy();
    alert.mockRestore();
  });

  it("offers no decline, withdraw, contact or payment actions — those rules aren't defined", async () => {
    const { queryByRole, queryByText } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={getSeekerCompletedJobs()} />,
      { applications: seekerApplications },
    );

    expect(
      queryByRole("button", { name: /decline|reject|withdraw|cancel|call|message|pay/i }),
    ).toBeNull();
    expect(queryByText(FORBIDDEN_COPY)).toBeNull();
    expect(queryByText(/not selected|expired|rejected/i)).toBeNull();
  });

  it("shows completed work with the rating and feedback received, without naming who wrote it", async () => {
    const completed = getSeekerCompletedJobs();
    const { getByRole, getByText, getAllByLabelText, queryByText } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={completed} />,
      { applications: seekerApplications },
    );

    await fireEvent.press(getByRole("tab", { name: `Completed, ${completed.length}` }));

    for (const job of completed) {
      expect(getByText(job.title)).toBeTruthy();
      expect(getByText(`“${job.seekerFeedback.comment}”`)).toBeTruthy();
    }
    expect(getAllByLabelText(/^Rating you received: \d\.\d out of 5$/)).toHaveLength(
      completed.length,
    );
    expect(getByText("Hidden on your profile")).toBeTruthy();
    // No reviewer identity next to written feedback.
    expect(queryByText("Shirin Akter")).toBeNull();
  });

  it("shows an empty state that leads to Home when there are no applications", async () => {
    const { getByText, getByRole } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={[]} />,
    );

    expect(getByText("No applications yet")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Find jobs" }));
    expect(push).toHaveBeenCalledWith("/(worker)");
  });

  it("shows an empty Completed tab", async () => {
    const { getByText } = await renderSeeker(
      <SeekerApplicationsScreen completedJobs={[]} initialTab="completed" />,
    );

    expect(getByText("No completed work yet")).toBeTruthy();
  });
});
