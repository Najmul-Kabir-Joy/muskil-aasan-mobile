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

/** Drives a fresh Get Started render up to (but not through) the silent preference screen. */
async function reachPreferenceScreenFromGetStarted(render_: typeof render) {
  const utils = await render_(<OnboardingScreen />);
  const { getByRole, getByPlaceholderText, getByText, getByLabelText } = utils;

  await fillBasicInfo(getByPlaceholderText, getByText);
  await fireEvent.press(getByRole("button", { name: "Continue" }));
  await fireEvent.press(getByRole("button", { name: "Skip for now" }));
  await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1712345678");
  await fireEvent.press(getByRole("button", { name: "Send Code →" }));
  await completeOtp(getByLabelText, getByRole);

  return utils;
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

  it("lets Back return to the previous screen", async () => {
    const { getByRole, getByPlaceholderText, getByText, queryByText } = await render(
      <OnboardingScreen />,
    );

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(getByRole("button", { name: "Continue" }));
    expect(queryByText("Verify your identity")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Back" }));
    expect(getByPlaceholderText("e.g. Tanvir Hossain")).toBeTruthy();
  });

  it("shows the primary-interaction preference after Phone OTP, uncounted in the Step X of Y progress, with no Back button", async () => {
    const { getByText, queryByText, queryByRole } =
      await reachPreferenceScreenFromGetStarted(render);

    expect(getByText("How would you like to use it?")).toBeTruthy();
    expect(queryByText(/^Step \d of \d$/)).toBeNull();
    expect(queryByRole("button", { name: "Back" })).toBeNull();
  });

  it("does not reveal the category picker until Job Seeker preference is selected", async () => {
    const { getByRole, queryByText } = await reachPreferenceScreenFromGetStarted(render);

    expect(queryByText(/Pick up to 5 categories/)).toBeNull();
    await fireEvent.press(getByRole("button", { name: /I'd like to help/ }));
    expect(queryByText(/Pick up to 5 categories/)).toBeTruthy();
  });

  it("caps category selection at 5", async () => {
    const { getByRole, getByText } = await reachPreferenceScreenFromGetStarted(render);

    await fireEvent.press(getByRole("button", { name: /I'd like to help/ }));
    const categoryNames = ["Repair", "Tutor", "Delivery", "Design", "Photo", "Admin"];
    for (const name of categoryNames) {
      await fireEvent.press(getByRole("button", { name }));
    }

    expect(getByText("5/5 selected")).toBeTruthy();
  });

  it("Job Provider preference routes to the provider prototype destination, not silently to Job Seeker", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await reachPreferenceScreenFromGetStarted(render);

    await fireEvent.press(getByRole("button", { name: /I need help/ }));
    await fireEvent.press(getByRole("button", { name: "Finish" }));

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });

  it("Job Seeker preference routes to the seeker prototype destination", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await reachPreferenceScreenFromGetStarted(render);

    await fireEvent.press(getByRole("button", { name: /I'd like to help/ }));
    await fireEvent.press(getByRole("button", { name: "Finish" }));

    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
  });

  it("'I'm not sure yet' does NOT default to Job Provider — it routes to the neutral prototype home", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await reachPreferenceScreenFromGetStarted(render);

    await fireEvent.press(getByRole("button", { name: "I'm not sure yet" }));

    expect(replace).toHaveBeenCalledWith("/prototype-home");
    expect(replace).not.toHaveBeenCalledWith("/(poster)");
  });

  it("arriving from Log In (phone already verified) skips the phone step, still requires Basic Info, and reaches the preference screen after Identity", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    mockUseLocalSearchParams.mockReturnValue({ phone: "1712345678" });

    const { getByRole, getByPlaceholderText, getByText, queryByText } = await render(
      <OnboardingScreen />,
    );

    expect(queryByText("Step 1 of 2")).toBeTruthy();
    expect(queryByText("Phone verified (+880 1712345678)")).toBeTruthy();
    expect(queryByText("Mobile Number")).toBeNull();

    const continueButton = getByRole("button", { name: "Continue" });
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fillBasicInfo(getByPlaceholderText, getByText);
    await fireEvent.press(continueButton);
    expect(queryByText("Step 2 of 2")).toBeTruthy();
    expect(queryByText("Verify your identity")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Skip for now" }));
    expect(queryByText("How would you like to use it?")).toBeTruthy();
    expect(queryByText(/^Step \d of \d$/)).toBeNull();

    await fireEvent.press(getByRole("button", { name: "I'm not sure yet" }));

    expect(replace).toHaveBeenCalledWith("/prototype-home");
  });
});
