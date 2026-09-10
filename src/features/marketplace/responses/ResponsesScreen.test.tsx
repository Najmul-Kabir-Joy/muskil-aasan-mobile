import { render } from "@testing-library/react-native";
import { ResponsesScreen } from "./ResponsesScreen";

describe("ResponsesScreen", () => {
  it("renders the safe placeholder heading and empty state, not any offer/response data", async () => {
    const { getByText, queryByText } = await render(<ResponsesScreen />);

    expect(getByText("Responses")).toBeTruthy();
    expect(getByText("No responses yet")).toBeTruthy();
    expect(getByText("Responses to your job posts will appear here.")).toBeTruthy();

    // No offer-management assumptions (ratings, verification, status, offer
    // amounts) belong on this placeholder — that flow isn't designed yet.
    expect(queryByText(/rating/i)).toBeNull();
    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/submitted|viewed|accepted|rejected/i)).toBeNull();
  });

  it("does not render the Provider app-shell header itself — that's owned by the (poster) layout", async () => {
    const { queryByLabelText } = await render(<ResponsesScreen />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });
});
