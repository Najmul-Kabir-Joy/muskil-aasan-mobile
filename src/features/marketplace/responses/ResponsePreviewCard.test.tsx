import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ResponsePreviewCard } from "./ResponsePreviewCard";
import { jobResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const response = jobResponses[0];

describe("ResponsePreviewCard", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("shows the Job Seeker's public identity, Seeker Rating, rating count, category, message preview, and received time", async () => {
    const { getByText } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );

    expect(getByText(response.worker.name)).toBeTruthy();
    expect(getByText(response.worker.area)).toBeTruthy();
    expect(
      getByText(`${response.worker.rating} · ${response.worker.ratingCount} ratings`),
    ).toBeTruthy();
    expect(getByText("Repair")).toBeTruthy();
    expect(getByText(`“${response.message}”`)).toBeTruthy();
    expect(getByText(`Received ${response.receivedAgo}`)).toBeTruthy();
  });

  it("uses the singular for a Seeker with a single rating", async () => {
    const singleRating = {
      ...response,
      worker: { ...response.worker, ratingCount: 1 },
    };
    const { getByText } = await render(
      <ResponsePreviewCard response={singleRating} category="Repair" />,
    );

    expect(getByText(`${response.worker.rating} · 1 rating`)).toBeTruthy();
  });

  it("truncates the message to a three-line preview rather than showing it in full", async () => {
    const { getByText } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );

    const preview = getByText(`“${response.message}”`);
    expect(preview.props.numberOfLines).toBe(3);
  });

  it("still renders a very long message and a very long name without dropping the View Response action", async () => {
    const longResponse = {
      ...response,
      message: "I can help with this job. ".repeat(40).trim(),
      worker: { ...response.worker, name: "Muhammad Abdur Rahman Chowdhury Al-Mamun" },
    };
    const { getByText, getByRole } = await render(
      <ResponsePreviewCard response={longResponse} category="Repair" />,
    );

    // The name is never ellipsized — a Provider is choosing between people.
    expect(getByText(longResponse.worker.name).props.numberOfLines).toBeUndefined();
    expect(getByText(`“${longResponse.message}”`).props.numberOfLines).toBe(3);
    expect(
      getByRole("button", { name: `View response from ${longResponse.worker.name}` }),
    ).toBeTruthy();
  });

  it("never shows a hire/select action, contact details, distance, verification badge, or trust wording on the list card", async () => {
    const { queryByText, queryByRole } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );

    expect(queryByRole("button", { name: /select/i })).toBeNull();
    expect(queryByRole("button", { name: /hire/i })).toBeNull();
    expect(queryByRole("button", { name: /message|chat|call/i })).toBeNull();
    expect(queryByText(/\+880/)).toBeNull();
    expect(queryByText(/@/)).toBeNull();
    expect(queryByText(/\d\s?km/i)).toBeNull();
    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trusted/i)).toBeNull();
  });

  it("View Response navigates to the Response Detail route with this response's id", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push, replace: jest.fn() });

    const { getByRole } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );
    await fireEvent.press(
      getByRole("button", { name: `View response from ${response.worker.name}` }),
    );

    expect(push).toHaveBeenCalledWith({
      pathname: "/(poster)/response-detail",
      params: { id: response.id },
    });
  });
});
