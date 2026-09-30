import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import MyJobsRoute from "../app/(poster)/tasks";
import { tasks } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe("My Jobs route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
  });

  it("renders the Provider's My Jobs with their own jobs", async () => {
    const { getByText } = await render(<MyJobsRoute />);

    expect(getByText("My Jobs")).toBeTruthy();
    expect(getByText(tasks[0].title)).toBeTruthy();
  });

  it("does not render the Provider shell's header itself — that's owned by the (poster) layout", async () => {
    const { queryByLabelText } = await render(<MyJobsRoute />);

    expect(queryByLabelText("Open navigation menu")).toBeNull();
  });
});
