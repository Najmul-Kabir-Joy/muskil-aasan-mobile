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
    const { getByText, getByRole } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(getByRole("header", { name: "No responses yet" })).toBeTruthy();
    expect(
      getByText(
        "Responses to your job posts will appear here. When Job Seekers respond, you'll be able to review their profiles and choose someone to help.",
      ),
    ).toBeTruthy();
  });

  it("shows the active job preview: title, area, budget, and posted timing", async () => {
    const { getByText } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(getByText("You have 1 active job post")).toBeTruthy();
    expect(getByText(activeJob.title)).toBeTruthy();
    expect(getByText(`Budget: ${activeJob.budget}`)).toBeTruthy();
    expect(
      getByText(`${activeJob.area} • ${activeJob.budget} • Posted ${activeJob.postedAgo}`),
    ).toBeTruthy();
  });

  it("leaves out the posted timing when the job has none, without a dangling separator", async () => {
    const { getByText } = await render(
      <ResponsesEmptyState activeJob={{ ...activeJob, postedAgo: undefined }} />,
    );

    expect(getByText(`${activeJob.area} • ${activeJob.budget}`)).toBeTruthy();
  });

  it("lets a very long job title wrap onto two lines instead of pushing the actions off screen", async () => {
    const longTitle =
      "Need an experienced electrician to rewire the entire third-floor flat and replace every old ceiling fan regulator before Eid";
    const { getByText, getByRole } = await render(
      <ResponsesEmptyState activeJob={{ ...activeJob, title: longTitle }} />,
    );

    expect(getByText(longTitle).props.numberOfLines).toBe(2);
    expect(getByRole("button", { name: /View My Jobs/ })).toBeTruthy();
    expect(getByRole("button", { name: /Post Another Job/ })).toBeTruthy();
  });

  it("does not render an active job preview when there isn't one, but keeps both actions", async () => {
    const { queryByText, getByRole } = await render(<ResponsesEmptyState activeJob={null} />);

    expect(queryByText("You have 1 active job post")).toBeNull();
    expect(getByRole("button", { name: /View My Jobs/ })).toBeTruthy();
    expect(getByRole("button", { name: /Post Another Job/ })).toBeTruthy();
  });

  it("does not invent response-time, matching, or trust promises", async () => {
    const { queryByText } = await render(<ResponsesEmptyState activeJob={activeJob} />);

    expect(queryByText(/usually respond/i)).toBeNull();
    expect(queryByText(/minutes|hours/i)).toBeNull();
    expect(queryByText(/recommend/i)).toBeNull();
    expect(queryByText(/match/i)).toBeNull();
    expect(queryByText(/verified|trusted|guarantee/i)).toBeNull();
  });

  it("View My Jobs navigates to the existing Provider My Jobs route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<ResponsesEmptyState activeJob={activeJob} />);
    await fireEvent.press(getByRole("button", { name: /View My Jobs/ }));

    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });

  it("Post Another Job navigates to the existing Provider Post Job route", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(<ResponsesEmptyState activeJob={activeJob} />);
    await fireEvent.press(getByRole("button", { name: /Post Another Job/ }));

    expect(push).toHaveBeenCalledWith("/(poster)/post-task");
  });
});
