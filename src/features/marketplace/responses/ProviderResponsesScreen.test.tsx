import { fireEvent, render, within } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProviderResponsesScreen } from "./ProviderResponsesScreen";
import { getActiveJob, getJobsWithResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const jobsWithResponses = getJobsWithResponses();
const [firstJob, secondJob] = jobsWithResponses;
const totalResponses = jobsWithResponses.reduce((sum, { responses }) => sum + responses.length, 0);

// A chip's accessible name is its label plus its count badge ("All Jobs 5").
function chipName(label: string) {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}

describe("ProviderResponsesScreen — canonical (has responses)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("has more than one job with responses in the default data, so grouping and filtering are meaningful", () => {
    expect(jobsWithResponses.length).toBeGreaterThan(1);
  });

  it("renders the Responses heading, subtitle, and a summary of how many jobs have responses", async () => {
    const { getByRole, getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(getByRole("header", { name: "Responses" })).toBeTruthy();
    expect(getByText("Review Job Seekers who responded to your active job posts.")).toBeTruthy();
    expect(getByText(`${jobsWithResponses.length} active jobs with responses`)).toBeTruthy();
  });

  it("renders the summary in the singular for a single job", async () => {
    const { getByText } = await render(<ProviderResponsesScreen jobsWithResponses={[firstJob]} />);

    expect(getByText("1 active job with responses")).toBeTruthy();
  });

  it("renders every job that has responses as its own group", async () => {
    const { getAllByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    for (const { task } of jobsWithResponses) {
      // Each job's title renders both as a filter chip label and as its
      // group's header, so exactly two matches are expected.
      expect(getAllByText(task.title)).toHaveLength(2);
    }
  });

  it("shows every responder on the unfiltered list, each under their own job", async () => {
    const { getAllByRole, getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    for (const { responses } of jobsWithResponses) {
      for (const response of responses) {
        expect(getByText(response.worker.name)).toBeTruthy();
      }
    }
    expect(getAllByRole("button", { name: /^View response from/ })).toHaveLength(totalResponses);
  });

  it("shows the correct response count on each job group", async () => {
    const { getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    for (const { responses } of jobsWithResponses) {
      const label = `${responses.length} ${responses.length === 1 ? "response" : "responses"}`;
      expect(getByText(label)).toBeTruthy();
    }
  });

  it("does not repeat the product name or render its own header/menu — the Provider shell owns those", async () => {
    const { queryByLabelText, queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(queryByLabelText("Open navigation menu")).toBeNull();
    expect(queryByText("MuSkill Aasan")).toBeNull();
  });

  it("does not expose phone, email, precise distance, verification, or trust signals on any card", async () => {
    const { queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(queryByText(/\+880/)).toBeNull();
    expect(queryByText(/@/)).toBeNull();
    expect(queryByText(/\d\s?km/i)).toBeNull();
    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trust/i)).toBeNull();
    expect(queryByText(/completion rate/i)).toBeNull();
  });

  it("offers an All Jobs chip plus one chip per job, each with its response count", async () => {
    const { getByRole } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    const allChip = within(getByRole("button", { name: chipName("All Jobs") }));
    expect(allChip.getByText("All Jobs")).toBeTruthy();
    expect(allChip.getByText(String(totalResponses))).toBeTruthy();
    for (const { task, responses } of jobsWithResponses) {
      const chip = within(getByRole("button", { name: chipName(task.title) }));
      expect(chip.getByText(task.title)).toBeTruthy();
      expect(chip.getByText(String(responses.length))).toBeTruthy();
    }
  });

  it("the job filter chips expose their selected state and default to All Jobs", async () => {
    const { getByRole } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(getByRole("button", { name: chipName("All Jobs") }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(
      getByRole("button", { name: chipName(firstJob.task.title) }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: false }));
  });

  it("selecting a job filter shows only that job's responders — for each job in turn", async () => {
    const { getByRole, getByText, queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    await fireEvent.press(getByRole("button", { name: chipName(firstJob.task.title) }));
    for (const response of firstJob.responses) {
      expect(getByText(response.worker.name)).toBeTruthy();
    }
    for (const response of secondJob.responses) {
      expect(queryByText(response.worker.name)).toBeNull();
    }
    expect(
      getByRole("button", { name: chipName(firstJob.task.title) }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: true }));

    await fireEvent.press(getByRole("button", { name: chipName(secondJob.task.title) }));
    for (const response of secondJob.responses) {
      expect(getByText(response.worker.name)).toBeTruthy();
    }
    for (const response of firstJob.responses) {
      expect(queryByText(response.worker.name)).toBeNull();
    }
  });

  it("selecting All Jobs after a filter shows every job again", async () => {
    const { getByRole, getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    await fireEvent.press(getByRole("button", { name: chipName(firstJob.task.title) }));
    await fireEvent.press(getByRole("button", { name: chipName("All Jobs") }));

    expect(getByText(firstJob.responses[0].worker.name)).toBeTruthy();
    expect(getByText(secondJob.responses[0].worker.name)).toBeTruthy();
  });

  it("falls back to showing all jobs if the selected job disappears from the data", async () => {
    const { getByRole, getByText, rerender } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    await fireEvent.press(getByRole("button", { name: chipName(firstJob.task.title) }));
    await rerender(<ProviderResponsesScreen jobsWithResponses={[secondJob]} />);

    expect(getByText(secondJob.responses[0].worker.name)).toBeTruthy();
    expect(getByRole("button", { name: chipName("All Jobs") }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("keeps a very long job title readable: the group shows it in full and the chip ellipsizes", async () => {
    const longTitle =
      "Need an experienced electrician to rewire the entire third-floor flat and replace every old ceiling fan regulator before Eid";
    const longTitleJob = { ...firstJob, task: { ...firstJob.task, title: longTitle } };
    const { getAllByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[longTitleJob]} />,
    );

    const [chipLabel, groupTitle] = getAllByText(longTitle);
    expect(chipLabel.props.numberOfLines).toBe(1);
    expect(groupTitle.props.numberOfLines).toBeUndefined();
  });
});

describe("ProviderResponsesScreen — empty (no responses)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the empty state instead of any job group", async () => {
    const { getByText, queryByRole } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={getActiveJob()} />,
    );

    expect(getByText("No responses yet")).toBeTruthy();
    // No response cards for any job — the active job preview shown below
    // is informational only and has no "View Response" action of its own.
    expect(queryByRole("button", { name: /^View response from/ })).toBeNull();
  });

  it("keeps the Responses heading and subtitle above the empty state, without the job summary", async () => {
    const { getByRole, getByText, queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={getActiveJob()} />,
    );

    expect(getByRole("header", { name: "Responses" })).toBeTruthy();
    expect(getByText("Review Job Seekers who responded to your active job posts.")).toBeTruthy();
    expect(queryByText(/active jobs? with responses/)).toBeNull();
  });

  it("still shows the active job preview in the empty state", async () => {
    const activeJob = getActiveJob()!;
    const { getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={activeJob} />,
    );

    expect(getByText(activeJob.title)).toBeTruthy();
  });

  it("renders no job filter chips and does not repeat the product name when there are no responses", async () => {
    const { queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={getActiveJob()} />,
    );

    expect(queryByText("All Jobs")).toBeNull();
    expect(queryByText("MuSkill Aasan")).toBeNull();
  });
});
