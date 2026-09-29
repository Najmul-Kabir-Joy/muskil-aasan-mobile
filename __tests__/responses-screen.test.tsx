import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ResponsesRoute from "../app/(poster)/responses";
import { getJobsWithResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("Responses route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the Responses feature screen with real jobs and responders from mock data", async () => {
    const { getByText, getAllByText } = await render(<ResponsesRoute />);

    expect(getByText("Responses")).toBeTruthy();
    const [firstJob] = getJobsWithResponses();
    expect(getAllByText(firstJob.task.title).length).toBeGreaterThan(0);
    expect(getByText(firstJob.responses[0].worker.name)).toBeTruthy();
  });
});
