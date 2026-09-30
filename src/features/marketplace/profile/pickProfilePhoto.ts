import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { ProfilePhoto } from "@/types/domain";

/**
 * Opens the device photo library and returns the chosen photo, unframed
 * (centred, no zoom), or null if the person backs out.
 *
 * No system crop (`allowsEditing`): on iOS it's always square, which can't
 * frame a wide cover, so the profile's own photo editor does the cropping
 * for both photos instead. The library picker itself needs no permission
 * prompt on current iOS/Android.
 */
export async function pickProfilePhoto(): Promise<ProfilePhoto | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return null;
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    };
  } catch {
    Alert.alert("Couldn't open your photos", "Please try again.");
    return null;
  }
}
