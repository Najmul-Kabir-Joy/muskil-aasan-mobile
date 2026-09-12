import { render } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import ProviderComingSoonRoute from "../app/(poster)/coming-soon";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("Provider coming-soon route", () => {
  it("renders the title passed via route params", async () => {
    mockUseLocalSearchParams.mockReturnValue({ title: "Job Interests" });

    const { getByText } = await render(<ProviderComingSoonRoute />);

    expect(getByText("Job Interests")).toBeTruthy();
  });

  it("falls back to a generic title when none is provided", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText, getAllByText } = await render(<ProviderComingSoonRoute />);

    // Both the page header and the empty-state heading read "Coming soon"
    // when no title param is given.
    expect(getAllByText("Coming soon")).toHaveLength(2);
    expect(getByText("Coming soon isn't available yet in this prototype.")).toBeTruthy();
  });
});
