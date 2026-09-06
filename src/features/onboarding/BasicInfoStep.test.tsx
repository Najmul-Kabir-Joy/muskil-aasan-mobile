import { fireEvent, render } from "@testing-library/react-native";
import { useState } from "react";
import { BasicInfo, BasicInfoStep, EMPTY_BASIC_INFO } from "./BasicInfoStep";

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

function ControlledBasicInfoStep({ phoneVerified }: { phoneVerified?: string }) {
  const [value, setValue] = useState<BasicInfo>(EMPTY_BASIC_INFO);
  return (
    <BasicInfoStep
      value={value}
      onChange={(patch) => setValue((current) => ({ ...current, ...patch }))}
      phoneVerified={phoneVerified}
    />
  );
}

describe("BasicInfoStep", () => {
  it("selects a gender chip and deselects it on a second press", async () => {
    const { getByRole } = await render(<ControlledBasicInfoStep />);

    const maleChip = getByRole("button", { name: /Male/ });
    expect(maleChip.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));

    await fireEvent.press(maleChip);
    expect(maleChip.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));

    await fireEvent.press(maleChip);
    expect(maleChip.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));
  });

  it("selecting a different gender chip deselects the previous one", async () => {
    const { getByRole } = await render(<ControlledBasicInfoStep />);

    const maleChip = getByRole("button", { name: /Male/ });
    const femaleChip = getByRole("button", { name: /Female/ });

    await fireEvent.press(maleChip);
    await fireEvent.press(femaleChip);

    expect(maleChip.props.accessibilityState).toEqual(expect.objectContaining({ selected: false }));
    expect(femaleChip.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("updates the bio character counter as the user types", async () => {
    const { getByPlaceholderText, getByText } = await render(<ControlledBasicInfoStep />);

    expect(getByText("0/150")).toBeTruthy();

    await fireEvent.changeText(
      getByPlaceholderText("Write a brief note about yourself..."),
      "Reliable and punctual.",
    );

    expect(getByText("22/150")).toBeTruthy();
  });

  it("shows the phone-verified pill only when a phone number is passed", async () => {
    const { queryByText, rerender } = await render(<ControlledBasicInfoStep />);
    expect(queryByText(/Phone verified/)).toBeNull();

    await rerender(<ControlledBasicInfoStep phoneVerified="1712345678" />);
    expect(queryByText("Phone verified (+880 1712345678)")).toBeTruthy();
  });

  it("selects an area from the picker modal", async () => {
    const { getByText } = await render(<ControlledBasicInfoStep />);

    await fireEvent.press(getByText("Select your area (e.g. Dhanmondi, Mirpur)"));
    await fireEvent.press(getByText("Mirpur 10"));

    expect(getByText("Mirpur 10")).toBeTruthy();
  });
});
