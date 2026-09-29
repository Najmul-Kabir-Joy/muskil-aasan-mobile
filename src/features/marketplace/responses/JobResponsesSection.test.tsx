import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { JobResponsesSection } from "./JobResponsesSection";
import { getJobsWithResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const jobWithResponses = getJobsWithResponses().find((group) => group.task.id === "t1")!;

describe("JobResponsesSection", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("shows the job's title, area, and budget", async () => {
    const { getByText, getAllByText } = await render(
      <JobResponsesSection task={jobWithResponses.task} responses={jobWithResponses.responses} />,
    );

    expect(getByText(jobWithResponses.task.title)).toBeTruthy();
    // Some of this job's own responders happen to share its area string in
    // the mock data, so more than one match is expected here.
    expect(getAllByText(jobWithResponses.task.area).length).toBeGreaterThan(0);
    expect(getByText(jobWithResponses.task.budget)).toBeTruthy();
  });

  it("displays the actual response count, derived from the responses it renders", async () => {
    const { getByText, getAllByText } = await render(
      <JobResponsesSection task={jobWithResponses.task} responses={jobWithResponses.responses} />,
    );

    expect(getByText(`${jobWithResponses.responses.length} responses`)).toBeTruthy();
    for (const response of jobWithResponses.responses) {
      expect(getAllByText(response.worker.name).length).toBeGreaterThan(0);
    }
  });

  it("pluralizes a single response correctly", async () => {
    const { getByText } = await render(
      <JobResponsesSection
        task={jobWithResponses.task}
        responses={[jobWithResponses.responses[0]]}
      />,
    );

    expect(getByText("1 response")).toBeTruthy();
  });

  it("renders exactly one ResponsePreviewCard per response — no duplicates, no cross-job leakage", async () => {
    const { getAllByRole } = await render(
      <JobResponsesSection task={jobWithResponses.task} responses={jobWithResponses.responses} />,
    );

    expect(getAllByRole("button", { name: /^View response from/ })).toHaveLength(
      jobWithResponses.responses.length,
    );
  });
});
