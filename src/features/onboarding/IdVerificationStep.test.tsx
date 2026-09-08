import { fireEvent, render } from "@testing-library/react-native";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { IdDocs, IdVerificationStep } from "./IdVerificationStep";

jest.mock("expo-image-picker", () => ({
  CameraType: { front: "front", back: "back" },
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const EMPTY_DOCS: IdDocs = { nidFront: null, nidBack: null, selfie: null };

const mockRequestCamera = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockRequestLibrary = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const mockLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;
const mockLaunchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe("IdVerificationStep", () => {
  beforeEach(() => {
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    mockRequestCamera.mockReset();
    mockRequestLibrary.mockReset();
    mockLaunchCamera.mockReset();
    mockLaunchLibrary.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a permission alert and does not capture when camera permission is denied", async () => {
    mockRequestCamera.mockResolvedValue({ granted: false });
    const onCapture = jest.fn();
    const { getAllByText } = await render(
      <IdVerificationStep docs={EMPTY_DOCS} onCapture={onCapture} />,
    );

    await fireEvent.press(getAllByText("Take Photo")[0]);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Permission needed",
      expect.stringContaining("camera"),
    );
    expect(onCapture).not.toHaveBeenCalled();
    expect(mockLaunchCamera).not.toHaveBeenCalled();
  });

  it("captures the NID front photo on a successful selection", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true });
    mockLaunchCamera.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://nid-front.jpg" }],
    });
    const onCapture = jest.fn();
    const { getAllByText } = await render(
      <IdVerificationStep docs={EMPTY_DOCS} onCapture={onCapture} />,
    );

    await fireEvent.press(getAllByText("Take Photo")[0]);

    expect(onCapture).toHaveBeenCalledWith("nidFront", "file://nid-front.jpg");
  });

  it("selects from the gallery when Gallery is pressed", async () => {
    mockRequestLibrary.mockResolvedValue({ granted: true });
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file://nid-back.jpg" }],
    });
    const onCapture = jest.fn();
    const { getAllByText } = await render(
      <IdVerificationStep docs={EMPTY_DOCS} onCapture={onCapture} />,
    );

    await fireEvent.press(getAllByText("Gallery")[1]);

    expect(onCapture).toHaveBeenCalledWith("nidBack", "file://nid-back.jpg");
  });

  it("takes the selfie using the front camera", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [{ uri: "file://selfie.jpg" }] });
    const onCapture = jest.fn();
    const { getByText } = await render(
      <IdVerificationStep docs={EMPTY_DOCS} onCapture={onCapture} />,
    );

    await fireEvent.press(getByText("Open Camera"));

    expect(mockLaunchCamera).toHaveBeenCalledWith(
      expect.objectContaining({ cameraType: ImagePicker.CameraType.front }),
    );
    expect(onCapture).toHaveBeenCalledWith("selfie", "file://selfie.jpg");
  });
});
