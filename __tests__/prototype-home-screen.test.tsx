import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import PrototypeHomeScreen from "../app/prototype-home";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("PrototypeHomeScreen", () => {
  it("lets the person explicitly choose a side instead of picking one for them", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ replace });
    const { getByRole } = await render(<PrototypeHomeScreen />);

    await fireEvent.press(getByRole("button", { name: "Need Help →" }));
    expect(replace).toHaveBeenCalledWith("/(poster)");

    await fireEvent.press(getByRole("button", { name: "Help & Earn →" }));
    expect(replace).toHaveBeenCalledWith("/(worker)/jobs");
  });
});
