import { render } from "@testing-library/react-native";
import { ComingSoonScreen } from "./ComingSoonScreen";

describe("ComingSoonScreen", () => {
  it("renders the given title and a generic not-yet-available message", async () => {
    const { getByText } = await render(<ComingSoonScreen title="Saved Jobs" />);

    expect(getByText("Saved Jobs")).toBeTruthy();
    expect(getByText("Coming soon")).toBeTruthy();
    expect(getByText("Saved Jobs isn't available yet in this prototype.")).toBeTruthy();
  });
});
