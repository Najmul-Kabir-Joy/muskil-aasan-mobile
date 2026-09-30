import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProviderMyJobsScreen } from "./ProviderMyJobsScreen";
import { completedJobs, tasks, workers } from "@/data/mock";
import type { ProviderJobs } from "@/types/domain";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const [openTask, secondOpenTask, hiredTask] = tasks;
const [rafiq, , arman] = workers;
const [hiddenJob] = completedJobs.filter((job) => job.providerVisibility === "hidden");
const [publicJob] = completedJobs.filter(
  (job) => job.providerVisibility === "public" && job.seekerId === rafiq.id,
);

const JOBS: ProviderJobs = {
  open: [
    { task: openTask, responseCount: 4 },
    { task: secondOpenTask, responseCount: 0 },
  ],
  inProgress: [{ task: hiredTask, seekers: [arman] }],
  completed: [
    { job: publicJob, seeker: rafiq },
    { job: hiddenJob, seeker: rafiq },
  ],
};

const EMPTY: ProviderJobs = { open: [], inProgress: [], completed: [] };

describe("ProviderMyJobsScreen", () => {
  let push: jest.Mock;

  beforeEach(() => {
    push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });
  });

  it("shows three tabs with counts, opening on Open", async () => {
    const { getByText, getByRole } = await render(<ProviderMyJobsScreen jobs={JOBS} />);

    expect(getByText("My Jobs")).toBeTruthy();
    expect(getByText("5 jobs posted")).toBeTruthy();
    expect(getByRole("tab", { name: "Open, 2" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByRole("tab", { name: "In progress, 1" })).toBeTruthy();
    expect(getByRole("tab", { name: "Completed, 2" })).toBeTruthy();
  });

  it("lists open jobs with their Response count and a way to the Responses tab", async () => {
    const { getByText, getAllByText, getByRole } = await render(
      <ProviderMyJobsScreen jobs={JOBS} />,
    );

    expect(getByText(openTask.title)).toBeTruthy();
    expect(getByText(openTask.budget)).toBeTruthy();
    expect(getAllByText("Open for responses")).toHaveLength(2);
    expect(getByText("4 responses")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: `View responses to ${openTask.title}` }));
    expect(push).toHaveBeenCalledWith("/(poster)/responses");
  });

  it("says when an open job has no responses yet, with nothing to view", async () => {
    const { getByText, queryByRole } = await render(<ProviderMyJobsScreen jobs={JOBS} />);

    expect(getByText("No responses yet")).toBeTruthy();
    expect(queryByRole("button", { name: `View responses to ${secondOpenTask.title}` })).toBeNull();
  });

  it("shows who is working on an in-progress job, and links to their public Seeker profile", async () => {
    const { getByText, getByRole } = await render(<ProviderMyJobsScreen jobs={JOBS} />);

    await fireEvent.press(getByRole("tab", { name: "In progress, 1" }));

    expect(getByText(hiredTask.title)).toBeTruthy();
    expect(getByText("Working with")).toBeTruthy();
    expect(getByText(arman.name)).toBeTruthy();
    expect(getByText("Arman accepted your job request.")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: `View ${arman.name}'s profile` }));
    expect(push).toHaveBeenCalledWith({
      pathname: "/(poster)/public-profile",
      params: { id: arman.id, view: "seeker" },
    });
  });

  it("offers no lifecycle actions on an in-progress job, since those rules aren't defined", async () => {
    const { getByRole, getAllByRole } = await render(<ProviderMyJobsScreen jobs={JOBS} />);

    await fireEvent.press(getByRole("tab", { name: "In progress, 1" }));

    // The card's only action is viewing the Job Seeker's profile.
    expect(getAllByRole("button").map((button) => button.props.accessibilityLabel)).toEqual([
      `View ${arman.name}'s profile`,
    ]);
  });

  it("shows completed jobs with who did them and the star rating received — no written feedback", async () => {
    const { getByText, getAllByText, getByRole, getByLabelText, queryByText } = await render(
      <ProviderMyJobsScreen jobs={JOBS} />,
    );

    await fireEvent.press(getByRole("tab", { name: "Completed, 2" }));

    expect(getByText(publicJob.title)).toBeTruthy();
    expect(getByText(`Completed ${publicJob.completedOn}`)).toBeTruthy();
    expect(getAllByText("Done by")).toHaveLength(2);
    expect(
      getByLabelText(`Rating you received: ${publicJob.providerRating.toFixed(1)} out of 5`),
    ).toBeTruthy();
    expect(queryByText(publicJob.seekerFeedback.comment, { exact: false })).toBeNull();
  });

  it("notes a completed job that's hidden on the public profile — My Jobs itself is private", async () => {
    const { getByText, getAllByText, getByRole } = await render(
      <ProviderMyJobsScreen jobs={JOBS} />,
    );

    await fireEvent.press(getByRole("tab", { name: "Completed, 2" }));

    expect(getByText(hiddenJob.title)).toBeTruthy();
    expect(getAllByText("Hidden on your profile")).toHaveLength(1);
  });

  it("each tab has its own empty state; the Open one leads to Post a Job", async () => {
    const { getByText, getByRole } = await render(<ProviderMyJobsScreen jobs={EMPTY} />);

    expect(getByText("No open jobs")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Post a Job" }));
    expect(push).toHaveBeenCalledWith("/(poster)/post-task");

    await fireEvent.press(getByRole("tab", { name: "In progress, 0" }));
    expect(getByText("Nothing in progress")).toBeTruthy();

    await fireEvent.press(getByRole("tab", { name: "Completed, 0" }));
    expect(getByText("No completed jobs yet")).toBeTruthy();
  });

  it("uses Responses, never the legacy offer / bid / hire language", async () => {
    const { queryByText } = await render(<ProviderMyJobsScreen jobs={JOBS} />);

    expect(queryByText(/offer|bid|hire|lowest price/i)).toBeNull();
  });

  it("reads the current Provider's jobs from the shared mock data by default", async () => {
    const { getByText } = await render(<ProviderMyJobsScreen />);

    expect(getByText(openTask.title)).toBeTruthy();
  });
});
