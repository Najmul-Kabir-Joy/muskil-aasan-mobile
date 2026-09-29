import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProviderResponseDetailScreen } from "./ProviderResponseDetailScreen";
import { getResponseWithJob } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const { task, response } = getResponseWithJob("r1")!;

describe("ProviderResponseDetailScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  });

  it("shows the original job context: title, area, budget, posted timing", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText("Response to:")).toBeTruthy();
    expect(getByText(task.title)).toBeTruthy();
    expect(
      getByText(`${task.area} • Budget: ${task.budget} • Posted ${task.postedAgo}`),
    ).toBeTruthy();
  });

  it("shows the Job Seeker's public identity and Seeker Rating, with a rating count", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText(response.worker.name)).toBeTruthy();
    expect(getByText(response.worker.area)).toBeTruthy();
    expect(
      getByText(`${response.worker.rating} · ${response.worker.ratingCount} ratings`),
    ).toBeTruthy();
  });

  it("renders the full response message, not truncated", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText(response.message)).toBeTruthy();
    expect(getByText(`Received ${response.receivedAgo}`)).toBeTruthy();
  });

  it("renders exactly one Previous Work & Feedback preview, attributed neutrally", async () => {
    const { getByText, getAllByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText("Previous Work & Feedback")).toBeTruthy();
    expect(getAllByText(response.previousWork.jobTitle)).toHaveLength(1);
    expect(getByText(`“${response.previousWork.comment}”`)).toBeTruthy();
    expect(getByText("Completed through Muskill Asaan")).toBeTruthy();
  });

  it("never exposes the previous-work reviewer's identity or any private contact information", async () => {
    const { queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByText(/hired by/i)).toBeNull();
    expect(queryByText(/verified customer/i)).toBeNull();
    expect(queryByText(/\+880/)).toBeNull();
    expect(queryByText(/@/)).toBeNull();
  });

  it("never shows verification badges, trust scores, or completion percentages", async () => {
    const { queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trust/i)).toBeNull();
    expect(queryByText(/completion rate/i)).toBeNull();
  });

  it("never introduces messaging, payment, or decline/rejection controls", async () => {
    const { queryByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByRole("button", { name: /message/i })).toBeNull();
    expect(queryByRole("button", { name: /pay/i })).toBeNull();
    expect(queryByRole("button", { name: /decline/i })).toBeNull();
    expect(queryByRole("button", { name: /reject/i })).toBeNull();
  });

  it("Select Job Seeker is a local prototype interaction: it flips to a disabled Selected state, with no navigation", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });

    const { getByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    const selectButton = getByRole("button", { name: `Select ${response.worker.name}` });
    await fireEvent.press(selectButton);

    expect(push).not.toHaveBeenCalled();
    const selectedButton = getByRole("button", { name: `${response.worker.name} selected` });
    expect(selectedButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("shows the job budget in the Select Job Seeker supporting copy", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(
      getByText(`Selecting this Job Seeker will send them a job request for ${task.budget}.`),
    ).toBeTruthy();
  });

  it("View Original Job routes to the existing My Jobs screen", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });

    const { getByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );
    await fireEvent.press(getByRole("button", { name: "View original job" }));

    expect(push).toHaveBeenCalledWith("/(poster)/tasks");
  });

  it("View Full Seeker Profile routes to the existing prototype placeholder, not a fake profile feature", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });

    const { getByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );
    await fireEvent.press(getByRole("button", { name: `View ${response.worker.name}'s profile` }));

    expect(push).toHaveBeenCalledWith({
      pathname: "/(poster)/coming-soon",
      params: { title: `${response.worker.name}'s Profile` },
    });
  });

  it("Back navigates back rather than to a hardcoded destination", async () => {
    const back = jest.fn();
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back });

    const { getByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );
    await fireEvent.press(getByRole("button", { name: "Back" }));

    expect(back).toHaveBeenCalledTimes(1);
  });
});
