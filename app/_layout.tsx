import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
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
