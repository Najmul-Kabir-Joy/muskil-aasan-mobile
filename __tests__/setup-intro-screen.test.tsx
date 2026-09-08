import { fireEvent, render } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SetupIntroScreen from "../app/setup-intro";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("SetupIntroScreen", () => {
  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ phone: "1712345678" });
  });

  it("routes to the onboarding wizard with the verified phone on Get Started", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await render(<SetupIntroScreen />);

    await fireEvent.press(getByRole("button", { name: "Get Started →" }));

    expect(replace).toHaveBeenCalledWith({
      pathname: "/onboarding",
      params: { phone: "1712345678" },
    });
  });

  it("does not offer a way to bypass required Basic Information", async () => {
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    const { queryByRole } = await render(<SetupIntroScreen />);

    expect(queryByRole("button", { name: "I'll complete this later" })).toBeNull();
  });

  it("does not show unapproved trust or engagement claims", async () => {
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    const { queryByText } = await render(<SetupIntroScreen />);

    expect(queryByText(/3x more replies/i)).toBeNull();
    expect(queryByText(/trusted/i)).toBeNull();
  });
});
