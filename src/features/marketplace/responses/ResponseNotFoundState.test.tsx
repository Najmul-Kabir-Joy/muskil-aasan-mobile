import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ResponseNotFoundState } from "./ResponseNotFoundState";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ResponseNotFoundState", () => {
  it("explains that the response couldn't be found", async () => {
    mockUseRouter.mockReturnValue({ push: jest.fn() });

    const { getByRole, getByText } = await render(<ResponseNotFoundState />);

    expect(getByRole("header", { name: "Response not found" })).toBeTruthy();
    expect(getByText(/couldn't find that response/)).toBeTruthy();
  });

  it("offers a single way out: back to the Responses list", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    const { getAllByRole, getByRole } = await render(<ResponseNotFoundState />);
    await fireEvent.press(getByRole("button", { name: "Back to Responses" }));

    expect(push).toHaveBeenCalledWith("/(poster)/responses");
    expect(getAllByRole("button")).toHaveLength(1);
  });
});
