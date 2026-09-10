import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import ProviderProfileRoute from "../app/(poster)/profile";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("Provider Profile tab route", () => {
  it("renders the shared Profile feature screen", async () => {
    mockUseRouter.mockReturnValue({ replace: jest.fn(), push: jest.fn() });

    const { getByText } = await render(<ProviderProfileRoute />);

    expect(getByText("Nadia Rahman")).toBeTruthy();
  });
});
