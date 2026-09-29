import { render } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ResponseDetailRoute from "../app/(poster)/response-detail";
import { jobResponses } from "@/data/mock";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

describe("Response Detail route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
  });

  it("resolves the id param to the matching response and its job", async () => {
    const response = jobResponses[0];
    mockUseLocalSearchParams.mockReturnValue({ id: response.id });

    const { getByText } = await render(<ResponseDetailRoute />);

    expect(getByText(response.worker.name)).toBeTruthy();
    expect(getByText(response.message)).toBeTruthy();
  });

  it("renders nothing for an id that doesn't match any response, instead of crashing", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "not-a-real-id" });

    const { toJSON } = await render(<ResponseDetailRoute />);

    expect(toJSON()).toBeNull();
  });

  it("renders nothing when no id param is present", async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { toJSON } = await render(<ResponseDetailRoute />);

    expect(toJSON()).toBeNull();
  });
});
