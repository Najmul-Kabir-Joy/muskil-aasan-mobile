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
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

async function fillBasicInfo(
  getByPlaceholderText: (text: string) => unknown,
  getByText: (text: string) => unknown,
) {
  await fireEvent.changeText(getByPlaceholderText("e.g. Tanvir Hossain") as never, "Rahim Uddin");
  await fireEvent.press(getByText("Select your area (e.g. Dhanmondi, Mirpur)") as never);
  await fireEvent.press(getByText("Dhanmondi") as never);
}

async function completeOtp(
  getByLabelText: (label: string) => unknown,
  getByRole: (role: string, options: { name: string }) => unknown,
) {
  const correctCode = "123456";
  for (let index = 0; index < correctCode.length; index += 1) {
    await fireEvent.changeText(
      getByLabelText(`Verification code digit ${index + 1} of 6`) as never,
      correctCode[index],
    );
  }
  await fireEvent.press(getByRole("button", { name: "Verify & Complete →" }) as never);
}

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace: jest.fn() });
    mockUseLocalSearchParams.mockReturnValue({});
  });

  it("arriving from Get Started: Basic info -> Identity -> Phone, all counted and labeled", async () => {
    const { getByRole, getByPlaceholderText, getByText, queryByText } = await render(
      <OnboardingScreen />,
    );

    expect(queryByText("Step 1 of 3")).toBeTruthy();
    const continueButton = getByRole("button", { name: "Continue" });
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fillBasicInfo(getByPlaceholderText, getByText);
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );

    await fireEvent.press(continueButton);
    expect(queryByText("Step 2 of 3")).toBeTruthy();
    expect(queryByText("Verify your identity")).toBeTruthy();
    expect(queryByText("Upload front of NID")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    expect(queryByText("Step 3 of 3")).toBeTruthy();
    expect(queryByText("Mobile Number")).toBeTruthy();
  });

  it("the use-case question appears after OTP verification, as a silent (uncounted) screen", async () => {
    const { getByRole, getByPlaceholderText, getByText, getByLabelText, queryByText } =
      await render(<OnboardingScreen />);

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    await fireEvent.press(getByRole("button", { name: "Skip for now" }));

    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await completeOtp(getByLabelText, getByRole);

    expect(queryByText("How would you like to use it?")).toBeTruthy();
    // Silent step: no "Step X of Y" progress indicator while here.
    expect(queryByText(/^Step \d of \d$/)).toBeNull();
  });

  it("lets Back return to the previous screen, including from the trailing use-case screen", async () => {
    const { getByRole, getByPlaceholderText, getByText, getByLabelText, queryByText } =
      await render(<OnboardingScreen />);

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    expect(queryByText("Verify your identity")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Back" }));
    expect(getByPlaceholderText("e.g. Tanvir Hossain")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Continue" }));
    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await completeOtp(getByLabelText, getByRole);
    expect(queryByText("How would you like to use it?")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Back" }));
    expect(queryByText("Mobile Number")).toBeTruthy();
  });

  it("choosing 'I'd like to help & earn' reveals categories, capped at 5", async () => {
    const { getByRole, getByPlaceholderText, getByText, getByLabelText, queryByText } =
      await render(<OnboardingScreen />);

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await completeOtp(getByLabelText, getByRole);

    expect(queryByText(/Pick up to 5 categories/)).toBeNull();
    await fireEvent.press(getByRole("button", { name: /I'd like to help/ }));
    expect(queryByText(/Pick up to 5 categories/)).toBeTruthy();

    const categoryNames = ["Repair", "Tutor", "Delivery", "Design", "Photo", "Admin"];
    for (const name of categoryNames) {
      await fireEvent.press(getByRole("button", { name }));
    }

    expect(getByText("5/5 selected")).toBeTruthy();
  });

  it("finishes into the worker jobs feed when Job Seeker was chosen", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole, getByPlaceholderText, getByText, getByLabelText } = await render(
      <OnboardingScreen />,
    );

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await completeOtp(getByLabelText, getByRole);

    await fireEvent.press(getByRole("button", { name: /I'd like to help/ }));
    await fireEvent.press(getByRole("button", { name: "Finish" }));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
  });

  it("'I'm not sure yet' finishes into the poster home without requiring a use-case choice", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole, getByPlaceholderText, getByText, getByLabelText } = await render(
      <OnboardingScreen />,
    );

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await completeOtp(getByLabelText, getByRole);

    await fireEvent.press(getByRole("button", { name: "I'm not sure yet" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });

  it("arriving from Log In (phone already verified) skips the phone step and finishes to the poster home", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUseLocalSearchParams.mockReturnValue({ phone: "1712345678" });

    const { getByRole, getByPlaceholderText, getByText, queryByText } = await render(
      <OnboardingScreen />,
    );

    expect(queryByText("Step 1 of 2")).toBeTruthy();
    expect(queryByText("Phone verified (+880 1712345678)")).toBeTruthy();

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    expect(queryByText("Step 2 of 2")).toBeTruthy();
    expect(queryByText("Verify your identity")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    expect(queryByText("How would you like to use it?")).toBeTruthy();
    expect(queryByText(/^Step \d of \d$/)).toBeNull();

    await fireEvent.press(getByRole("button", { name: "Finish" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });
});
