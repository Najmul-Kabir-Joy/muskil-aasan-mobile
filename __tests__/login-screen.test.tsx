import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import LoginScreen from "../app/login";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

async function fillOtp(getByLabelText: (label: string) => unknown, code: string) {
  for (let index = 0; index < code.length; index += 1) {
    await fireEvent.changeText(
      getByLabelText(`Verification code digit ${index + 1} of 6`) as never,
      code[index],
    );
  }
}

describe("LoginScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace: jest.fn() });
  });

  it("disables Send Code until a valid Bangladesh mobile number is entered, then reveals the OTP step", async () => {
    const { getByRole, getByPlaceholderText, queryByLabelText } = await render(<LoginScreen />);

    const sendCodeButton = getByRole("button", { name: "Send Code →" });
    expect(sendCodeButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
    expect(queryByLabelText("Verification code digit 1 of 6")).toBeNull();

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1712345678");

    expect(sendCodeButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );

    await fireEvent.press(sendCodeButton);

    expect(queryByLabelText("Verification code digit 1 of 6")).toBeTruthy();
  });

  it("normalizes a locally-dialed number (leading 0) to the 10-digit form", async () => {
    const { getByRole, getByPlaceholderText, getByText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "01712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));

    expect(getByText("Code sent to +880 1712345678")).toBeTruthy();
  });

  it("keeps Send Code disabled for an obviously invalid Bangladesh number", async () => {
    const { getByRole, getByPlaceholderText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "22345");

    expect(getByRole("button", { name: "Send Code →" }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("hides the OTP step again when Change number is pressed", async () => {
    const { getByRole, getByPlaceholderText, queryByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    expect(queryByLabelText("Verification code digit 1 of 6")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Change number" }));

    expect(queryByLabelText("Verification code digit 1 of 6")).toBeNull();
  });

  it("shows an error and does not navigate when the wrong code is verified", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace });
    const { getByRole, getByPlaceholderText, getByLabelText, getByText } = await render(
      <LoginScreen />,
    );

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await fillOtp(getByLabelText, "000000");
    await fireEvent.press(getByRole("button", { name: "Verify & Complete →" }));

    expect(getByText("That code doesn't look right. Try again.")).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it("calls router.back() from the back button", async () => {
    const back = jest.fn();
    mockUseRouter.mockReturnValue({ back, replace: jest.fn() });
    const { getByRole } = await render(<LoginScreen />);

    await fireEvent.press(getByRole("button", { name: "Go back" }));

    expect(back).toHaveBeenCalledTimes(1);
  });

  it("routes the dummy existing user to the existing-user transition screen after OTP verification", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace });
    const { getByRole, getByPlaceholderText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1700000000");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await fillOtp(getByLabelText, "123456");
    await fireEvent.press(getByRole("button", { name: "Verify & Complete →" }));

    expect(replace).toHaveBeenCalledWith("/existing-user-home");
  });

  it("routes a new phone number to the setup intro, carrying the verified phone", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace });
    const { getByRole, getByPlaceholderText, getByLabelText } = await render(<LoginScreen />);

    await fireEvent.changeText(getByPlaceholderText("17XXXXXXXX"), "1712345678");
    await fireEvent.press(getByRole("button", { name: "Send Code →" }));
    await fillOtp(getByLabelText, "123456");
    await fireEvent.press(getByRole("button", { name: "Verify & Complete →" }));

    expect(replace).toHaveBeenCalledWith({
      pathname: "/setup-intro",
      params: { phone: "1712345678" },
    });
  });

  it("has no Google sign-in button and no Bangla subtitle", async () => {
    const { queryByRole, queryByText } = await render(<LoginScreen />);

    expect(queryByRole("button", { name: /Google/i })).toBeNull();
    expect(queryByText("মুশকিল আসান")).toBeNull();
  });

  it("does not render the authenticated Provider app shell (pre-auth screen)", async () => {
    const { queryByLabelText } = await render(<LoginScreen />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
    expect(queryByLabelText("Post a Job")).toBeNull();
  });
});
