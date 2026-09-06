import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import LoginScreen from "../app/login";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("LoginScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace: jest.fn() });
  });

  it("disables Continue until a full mobile number is entered, then reveals the OTP step", async () => {
    const { getByRole, getByPlaceholderText, queryByLabelText } = await render(<LoginScreen />);

    const continueButton = getByRole("button", { name: "Continue →" });
    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
    expect(queryByLabelText("Verification code digit 1 of 4")).toBeNull();

    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");

    expect(continueButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );

    await fireEvent.press(continueButton);

    expect(queryByLabelText("Verification code digit 1 of 4")).toBeTruthy();
  });

  it("hides the OTP step again when Edit Number is pressed", async () => {
    const { getByRole, getByPlaceholderText, queryByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Continue →" }));
    expect(queryByLabelText("Verification code digit 1 of 4")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Edit Number" }));

    expect(queryByLabelText("Verification code digit 1 of 4")).toBeNull();
  });

  it("calls router.back() from the back button", async () => {
    const back = jest.fn();
    mockUseRouter.mockReturnValue({ back, replace: jest.fn() });
    const { getByRole } = await render(<LoginScreen />);

    await fireEvent.press(getByRole("button", { name: "Go back" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("routes the dummy existing user straight to the poster home after OTP verification", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace });
    const { getByRole, getByPlaceholderText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1700000000");
    await fireEvent.press(getByRole("button", { name: "Continue →" }));
    for (let digit = 1; digit <= 4; digit += 1) {
      await fireEvent.changeText(
        getByLabelText(`Verification code digit ${digit} of 4`),
        String(digit),
      );
    }

    expect(replace).toHaveBeenCalledWith("/(poster)");
  });

  it("routes a new phone number to onboarding, carrying the verified phone", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace });
    const { getByRole, getByPlaceholderText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("017XX-XXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Continue →" }));
    for (let digit = 1; digit <= 4; digit += 1) {
      await fireEvent.changeText(
        getByLabelText(`Verification code digit ${digit} of 4`),
        String(digit),
      );
    }

    expect(replace).toHaveBeenCalledWith({
      pathname: "/onboarding",
      params: { phone: "1712345678" },
    });
  });
});
