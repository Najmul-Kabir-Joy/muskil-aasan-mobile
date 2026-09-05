import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { fonts } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

const defaultTextStyle = { fontFamily: fonts.medium };
const anyText = Text as unknown as { defaultProps?: { style?: unknown } };
const anyTextInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
anyText.defaultProps = {
  ...anyText.defaultProps,
  style: [defaultTextStyle, anyText.defaultProps?.style],
};
anyTextInput.defaultProps = {
  ...anyTextInput.defaultProps,
  style: [defaultTextStyle, anyTextInput.defaultProps?.style],
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [fonts.regular]: PlusJakartaSans_400Regular,
    [fonts.medium]: PlusJakartaSans_500Medium,
    [fonts.semiBold]: PlusJakartaSans_600SemiBold,
    [fonts.bold]: PlusJakartaSans_700Bold,
    [fonts.extraBold]: PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(poster)" />
        <Stack.Screen name="(worker)" />
        <Stack.Screen name="task-status" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="support" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
