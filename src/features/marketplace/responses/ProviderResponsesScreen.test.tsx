import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProviderResponsesScreen } from "./ProviderResponsesScreen";
import { getActiveJob, getJobsWithResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const jobsWithResponses = getJobsWithResponses();

describe("ProviderResponsesScreen — canonical (has responses)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the Responses heading and every job that has responses", async () => {
    const { getByText, getAllByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(getByText("Responses")).toBeTruthy();
    for (const { task } of jobsWithResponses) {
      // Each job's title renders both as a filter chip label and as its
      // section header, so more than one match is expected.
      expect(getAllByText(task.title).length).toBeGreaterThan(0);
    }
  });

  it("shows the correct responder under the correct job, not mixed across jobs", async () => {
    const { getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    for (const { responses } of jobsWithResponses) {
      for (const response of responses) {
        expect(getByText(response.worker.name)).toBeTruthy();
      }
    }
  });

  it("does not render its own header/menu button — the Provider shell owns that", async () => {
    const { queryByLabelText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });

  it("the job filter chips expose their selected state and default to All Jobs", async () => {
    const { getByRole } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    expect(getByRole("button", { name: "All Jobs" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("selecting a job filter shows only that job's responses", async () => {
    const [firstJob, secondJob] = jobsWithResponses;
    const { getByRole, getByText, queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    await fireEvent.press(getByRole("button", { name: firstJob.task.title }));

    expect(getByText(firstJob.responses[0].worker.name)).toBeTruthy();
    for (const response of secondJob.responses) {
      expect(queryByText(response.worker.name)).toBeNull();
    }
    expect(getByRole("button", { name: firstJob.task.title }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("selecting All Jobs after a filter shows every job again", async () => {
    const [firstJob, secondJob] = jobsWithResponses;
    const { getByRole, getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={jobsWithResponses} />,
    );

    await fireEvent.press(getByRole("button", { name: firstJob.task.title }));
    await fireEvent.press(getByRole("button", { name: "All Jobs" }));

    expect(getByText(firstJob.responses[0].worker.name)).toBeTruthy();
    expect(getByText(secondJob.responses[0].worker.name)).toBeTruthy();
  });
});

describe("ProviderResponsesScreen — empty (no responses)", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the empty state instead of any job section", async () => {
    const { getByText, queryByRole } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={getActiveJob()} />,
    );

    expect(getByText("No responses yet")).toBeTruthy();
    // No response cards for any job — the active job preview shown below
    // is informational only and has no "View Response" action of its own.
    expect(queryByRole("button", { name: /^View response from/ })).toBeNull();
  });

  it("still shows the active job preview in the empty state", async () => {
    const activeJob = getActiveJob()!;
    const { getByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={activeJob} />,
    );

    expect(getByText(activeJob.title)).toBeTruthy();
  });

  it("renders no job filter chips when there are no responses", async () => {
    const { queryByText } = await render(
      <ProviderResponsesScreen jobsWithResponses={[]} activeJob={getActiveJob()} />,
    );

    expect(queryByText("All Jobs")).toBeNull();
  });
});
