import { fireEvent, render } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import OnboardingScreen from "../app/onboarding";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  CameraType: { front: "front", back: "back" },
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it("arriving from Get Started shows all 3 steps and gates Continue on a name", async () => {
    const { getByRole, getByPlaceholderText, queryByText } = await render(<OnboardingScreen />);

    expect(queryByText("Phone verification")).toBeTruthy();
    const continueButton = getByRole("button", { name: "Continue" });
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fireEvent.changeText(getByPlaceholderText("Your name"), "Rahim Uddin");
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );

    await fireEvent.press(continueButton);
    expect(queryByText("NID — front side")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    expect(queryByText("Mobile Number")).toBeTruthy();
  });

  it("lets Back return to the previous step", async () => {
    const { getByRole, getByPlaceholderText, queryByText } = await render(<OnboardingScreen />);

    await fireEvent.changeText(getByPlaceholderText("Your name"), "Rahim Uddin");
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    expect(queryByText("NID — front side")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Back" }));
    expect(getByPlaceholderText("Your name")).toBeTruthy();
  });

  it("arriving from Log In (phone already verified) skips the phone step and finishes to the poster home", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUseLocalSearchParams.mockReturnValue({ phone: "1712345678" });

    const { getByRole, getByPlaceholderText, queryByText } = await render(<OnboardingScreen />);

    expect(queryByText("Phone verification")).toBeNull();

    await fireEvent.changeText(getByPlaceholderText("Your name"), "Rahim Uddin");
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    expect(queryByText("NID — front side")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Finish" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });
});
