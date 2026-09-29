import { fireEvent, render } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ResponseDetailRoute from "../app/(poster)/response-detail";
import { getResponseWithJob, jobResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("Response Detail route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  });

  it("resolves the id param to the matching response and its job", async () => {
    const { response, task } = getResponseWithJob(jobResponses[0].id)!;
    mockUseLocalSearchParams.mockReturnValue({ id: response.id });

    const { getByText } = await render(<ResponseDetailRoute />);

    expect(getByText(response.worker.name)).toBeTruthy();
    expect(getByText(`“${response.message}”`)).toBeTruthy();
    expect(getByText(task.title)).toBeTruthy();
  });

  it("opens the correct response for each id, not always the first one", async () => {
    const other = jobResponses[jobResponses.length - 1];
    mockUseLocalSearchParams.mockReturnValue({ id: other.id });

    const { getByText, queryByText } = await render(<ResponseDetailRoute />);

    expect(getByText(other.worker.name)).toBeTruthy();
    expect(queryByText(jobResponses[0].worker.name)).toBeNull();
  });

  it("shows a not-found state for an id that doesn't match any response, instead of a blank screen", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "not-a-real-id" });

    const { getByText, queryByRole } = await render(<ResponseDetailRoute />);

    expect(getByText("Response not found")).toBeTruthy();
    expect(queryByRole("button", { name: /^Select / })).toBeNull();
  });

  it("shows the same not-found state when no id param is present", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText } = await render(<ResponseDetailRoute />);

    expect(getByText("Response not found")).toBeTruthy();
  });

  it("the not-found state offers a way back to the Responses list", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({ id: "not-a-real-id" });

    const { getByRole } = await render(<ResponseDetailRoute />);
    await fireEvent.press(getByRole("button", { name: "Back to Responses" }));

    expect(push).toHaveBeenCalledWith("/(poster)/responses");
  });

  it("does not carry a Selected state from one Job Seeker's response to the next one opened", async () => {
    // This route lives in a tab navigator, so it stays mounted while its
    // `id` param changes — selection must not leak across responses.
    const [first, second] = jobResponses;
    mockUseLocalSearchParams.mockReturnValue({ id: first.id });

    const { getByRole, queryByRole, rerender } = await render(<ResponseDetailRoute />);
    await fireEvent.press(getByRole("button", { name: `Select ${first.worker.name}` }));
    expect(getByRole("button", { name: `${first.worker.name} selected` })).toBeTruthy();

    mockUseLocalSearchParams.mockReturnValue({ id: second.id });
    await rerender(<ResponseDetailRoute />);

    expect(queryByRole("button", { name: `${second.worker.name} selected` })).toBeNull();
    expect(getByRole("button", { name: `Select ${second.worker.name}` })).toBeTruthy();
  });
});
