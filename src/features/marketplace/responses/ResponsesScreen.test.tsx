import { render } from "@testing-library/react-native";
import { ResponsesScreen } from "./ResponsesScreen";
import { offers } from "@/data/mock";

describe("ResponsesScreen", () => {
  it("renders a heading and every mock offer", async () => {
    const { getByText } = await render(<ResponsesScreen />);

    expect(getByText("Responses")).toBeTruthy();
    for (const offer of offers) {
      // Offer messages are unique per offer even when two offers share the
      // same worker, unlike `offer.worker.name`.
      expect(getByText(offer.message)).toBeTruthy();
    }
  });

  it("does not render the Provider app-shell header itself — that's owned by the (poster) layout", async () => {
    const { queryByLabelText } = await render(<ResponsesScreen />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });
});
