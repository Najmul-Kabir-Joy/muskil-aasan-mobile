import { render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import PostJobRoute from "../app/(poster)/post-task";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// Boundary mock: the real native picker can't render in a JS test
// environment. See src/features/marketplace/post-job/PostJobScreen.test.tsx
// for the full behavior coverage this route simply delegates to.
jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockUseRouter = useRouter as jest.Mock;

describe("Post a Job route", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace: jest.fn(), push: jest.fn() });
  });

  it("renders the Post Job feature screen", async () => {
    const { getByText } = await render(<PostJobRoute />);

    expect(getByText("Post a Job")).toBeTruthy();
  });
});
