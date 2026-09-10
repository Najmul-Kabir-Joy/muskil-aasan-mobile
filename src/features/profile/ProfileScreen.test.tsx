import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { ProfileScreen } from "./ProfileScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("ProfileScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace: jest.fn(), push: jest.fn() });
  });

  it("renders the trust profile and job seeker category sections", async () => {
    const { getByText } = await render(<ProfileScreen />);

    expect(getByText("Nadia Rahman")).toBeTruthy();
    expect(getByText("Trust profile")).toBeTruthy();
    expect(getByText("Job seeker categories")).toBeTruthy();
  });

  it("marking phone verified updates both the trust badge and the button label", async () => {
    const { getByText, getByRole, getAllByText } = await render(<ProfileScreen />);

    expect(getByText("Phone pending")).toBeTruthy();
    await fireEvent.press(getByRole("button", { name: "Mark phone verified" }));

    // Both the badge and the now-disabled button read "Phone verified".
    expect(getAllByText("Phone verified")).toHaveLength(2);
  });

  it("does not render the Provider app-shell header itself — that's owned by the (poster) layout", async () => {
    const { queryByLabelText } = await render(<ProfileScreen />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });
});
