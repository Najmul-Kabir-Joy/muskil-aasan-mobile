import { render } from "@testing-library/react-native";
import ResponsesRoute from "../app/(poster)/responses";

describe("Responses route", () => {
  it("renders the Responses feature screen", async () => {
    const { getByText } = await render(<ResponsesRoute />);

    expect(getByText("Responses")).toBeTruthy();
  });
});
