import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ResponsesEmptyState } from "./ResponsesEmptyState";
import { getActiveJob } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const activeJob = getActiveJob()!;

describe("ResponsesEmptyState", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("shows the no-responses heading and supporting copy", async () => {
    const { getByText } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(getByText("No responses yet")).toBeTruthy();
    expect(
      getByText(
        "Responses to your job posts will appear here. When Job Seekers respond, you'll be able to review their profiles and choose someone to help.",
      ),
    ).toBeTruthy();
  });

  it("still shows the active job preview (title, area, budget) even with zero responses", async () => {
    const { getByText } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(getByText(activeJob.title)).toBeTruthy();
    expect(getByText(activeJob.area)).toBeTruthy();
    expect(getByText(activeJob.budget)).toBeTruthy();
    expect(getByText("Active")).toBeTruthy();
  });

  it("does not render an active job preview when there isn't one", async () => {
    const { queryByText } = await render(<ResponsesEmptyState activeJob={null} />);

    expect(queryByText("Active")).toBeNull();
  });

  it("does not invent response-time or matching promises", async () => {
    const { queryByText } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(queryByText(/usually respond/i)).toBeNull();
    expect(queryByText(/recommend/i)).toBeNull();
    expect(queryByText(/match/i)).toBeNull();
  });

  it("View My Jobs navigates to the existing Provider My Jobs route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<ResponsesEmptyState activeJob={activeJob} />);
    await fireEvent.press(getByRole("button", { name: "View My Jobs" }));

    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });

  it("Post Another Job navigates to the existing Provider Post Job route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<ResponsesEmptyState activeJob={activeJob} />);
    await fireEvent.press(getByRole("button", { name: "Post Another Job" }));

    expect(push).toHaveBeenCalledWith("/(poster)/post-task");
  });
});
