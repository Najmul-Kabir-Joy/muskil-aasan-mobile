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
    expect(getByText(`Received ${response.receivedAgo}`)).toBeTruthy();
  });

  it("truncates the message to a preview rather than showing it in full", async () => {
    const { getByText } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );

    const preview = getByText(`“${response.message}”`);
    expect(preview.props.numberOfLines).toBe(2);
  });

  it("never shows a hire/select action, verification badge, or trust wording on the list card", async () => {
    const { queryByText, queryByRole } = await render(
      <ResponsePreviewCard response={response} category="Repair" />,
    );

    expect(queryByRole("button", { name: /select/i })).toBeNull();
    expect(queryByRole("button", { name: /hire/i })).toBeNull();
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
