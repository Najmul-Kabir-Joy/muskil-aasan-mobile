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

  it("has its own Back + Response Detail sub-header and does not repeat the product name", async () => {
    const { getByRole, queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByRole("button", { name: "Back" })).toBeTruthy();
    expect(getByRole("header", { name: "Response Detail" })).toBeTruthy();
    expect(queryByText("Muskill Asaan")).toBeNull();
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

  it("omits the posted timing for a job that has none, without a dangling separator", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={{ ...task, postedAgo: undefined }} response={response} />,
    );

    expect(getByText(`${task.area} • Budget: ${task.budget}`)).toBeTruthy();
  });

  it("shows the Job Seeker's public identity, Seeker Rating, and rating count", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText(response.worker.name)).toBeTruthy();
    expect(getByText(response.worker.area)).toBeTruthy();
    expect(getByText(`${response.worker.rating} Seeker Rating`)).toBeTruthy();
    expect(getByText(`(${response.worker.ratingCount} ratings)`)).toBeTruthy();
  });

  it("uses the singular for a Seeker with a single rating", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen
        task={task}
        response={{ ...response, worker: { ...response.worker, ratingCount: 1 } }}
      />,
    );

    expect(getByText("(1 rating)")).toBeTruthy();
  });

  it("renders the full response message with its sent time, not truncated", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    const message = getByText(`“${response.message}”`);
    expect(message.props.numberOfLines).toBeUndefined();
    expect(getByText("Response Message")).toBeTruthy();
    expect(getByText(`Sent ${response.receivedAgo}`)).toBeTruthy();
  });

  it("renders a very long job title, name, and message in full", async () => {
    const longTitle =
      "Need an experienced electrician to rewire the entire third-floor flat and replace every old ceiling fan regulator before Eid";
    const longMessage = "I can help with this job and bring my own tools. ".repeat(30).trim();
    const { getByText } = await render(
      <ProviderResponseDetailScreen
        task={{ ...task, title: longTitle }}
        response={{
          ...response,
          message: longMessage,
          worker: { ...response.worker, name: "Muhammad Abdur Rahman Chowdhury Al-Mamun" },
        }}
      />,
    );

    expect(getByText(longTitle).props.numberOfLines).toBeUndefined();
    expect(getByText(`“${longMessage}”`).props.numberOfLines).toBeUndefined();
    expect(getByText("Muhammad Abdur Rahman Chowdhury Al-Mamun")).toBeTruthy();
  });

  it("renders exactly one Previous Work & Feedback preview, attributed neutrally", async () => {
    const { getByText, getAllByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getAllByText("Previous Work & Feedback")).toHaveLength(1);
    expect(getAllByText(response.previousWork.jobTitle)).toHaveLength(1);
    expect(getAllByText("Completed through Muskill Asaan")).toHaveLength(1);
    expect(getByText(`“${response.previousWork.comment}”`)).toBeTruthy();
    expect(getByText(response.previousWork.rating.toFixed(1))).toBeTruthy();
  });

  it("shows the previous work's own star rating, not the Seeker's", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen
        task={task}
        response={{ ...response, previousWork: { ...response.previousWork, rating: 4 } }}
      />,
    );

    expect(getByText("4.0")).toBeTruthy();
  });

  it("never exposes the previous-work reviewer's identity or any private contact information", async () => {
    const { queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByText(/hired by/i)).toBeNull();
    expect(queryByText(/verified customer/i)).toBeNull();
    expect(queryByText(/reviewed by/i)).toBeNull();
    expect(queryByText(/\+880/)).toBeNull();
    expect(queryByText(/@/)).toBeNull();
    expect(queryByText(/phone|email|nid/i)).toBeNull();
  });

  it("never shows verification badges, trust scores, or completion percentages", async () => {
    const { queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trust/i)).toBeNull();
    expect(queryByText(/completion rate/i)).toBeNull();
    expect(queryByText(/success/i)).toBeNull();
    expect(queryByText(/%/)).toBeNull();
  });

  it("never introduces messaging, payment, or decline/rejection controls", async () => {
    const { queryByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(queryByRole("button", { name: /message|chat|call/i })).toBeNull();
    expect(queryByRole("button", { name: /pay/i })).toBeNull();
    expect(queryByRole("button", { name: /decline/i })).toBeNull();
    expect(queryByRole("button", { name: /reject/i })).toBeNull();
  });

  it("Select Job Seeker is offered once, before a Job Seeker is selected", async () => {
    const { getAllByRole, getByRole } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    const selectButton = getByRole("button", { name: `Select ${response.worker.name}` });
    expect(selectButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
    expect(getAllByRole("button", { name: /^Select / })).toHaveLength(1);
  });

  it("Select Job Seeker is a local prototype interaction: it flips to a disabled Selected state, with no navigation", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn(), back: jest.fn() });

    const { getByRole, getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    await fireEvent.press(getByRole("button", { name: `Select ${response.worker.name}` }));

    expect(push).not.toHaveBeenCalled();
    expect(getByText("Job Seeker Selected")).toBeTruthy();
    const selectedButton = getByRole("button", { name: `${response.worker.name} selected` });
    expect(selectedButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("once selected, offers no second selection action and stays selected", async () => {
    const { getByRole, queryByRole, queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    await fireEvent.press(getByRole("button", { name: `Select ${response.worker.name}` }));
    // Pressing the now-disabled button again must not change or re-arm anything.
    await fireEvent.press(getByRole("button", { name: `${response.worker.name} selected` }));

    expect(queryByRole("button", { name: `Select ${response.worker.name}` })).toBeNull();
    expect(queryByText("Select Job Seeker")).toBeNull();
    expect(getByRole("button", { name: `${response.worker.name} selected` })).toBeTruthy();
  });

  it("does not claim that selecting shares contact details or opens chat/payment", async () => {
    const { getByRole, queryByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    await fireEvent.press(getByRole("button", { name: `Select ${response.worker.name}` }));

    expect(queryByText(/contact/i)).toBeNull();
    expect(queryByText(/call details|phone number/i)).toBeNull();
    expect(queryByText(/payment|escrow/i)).toBeNull();
  });

  it("shows the job budget above the Select Job Seeker action", async () => {
    const { getByText } = await render(
      <ProviderResponseDetailScreen task={task} response={response} />,
    );

    expect(getByText(`Budget: ${task.budget}`)).toBeTruthy();
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
