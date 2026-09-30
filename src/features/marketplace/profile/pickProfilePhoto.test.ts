import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { pickProfilePhoto } from "./pickProfilePhoto";

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

const mockLaunchLibrary = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe("pickProfilePhoto", () => {
  beforeEach(() => {
    mockLaunchLibrary.mockReset();
  });

  it("returns the chosen photo, centred and unzoomed, ready for the photo editor", async () => {
    mockLaunchLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///photo.jpg", width: 1200, height: 800 }],
    });

    await expect(pickProfilePhoto()).resolves.toEqual({
      uri: "file:///photo.jpg",
      width: 1200,
      height: 800,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it("returns null when the person backs out", async () => {
    mockLaunchLibrary.mockResolvedValue({ canceled: true, assets: null });

    await expect(pickProfilePhoto()).resolves.toBeNull();
  });

  it("tells the person when the library can't open, instead of failing silently", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockLaunchLibrary.mockRejectedValue(new Error("picker unavailable"));

    await expect(pickProfilePhoto()).resolves.toBeNull();
    expect(alertSpy).toHaveBeenCalledWith("Couldn't open your photos", "Please try again.");
    alertSpy.mockRestore();
  });
});
