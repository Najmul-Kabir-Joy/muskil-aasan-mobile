import { fireEvent, render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ActionButton, AppHeader, Badge, SelectableChip } from "@/shared/components/ui";

describe("AppHeader", () => {
  it("shows the brand name exactly as spelled, without forcing it to upper case", async () => {
    const { getByText } = await render(<AppHeader title="My Jobs" />);

    const kicker = getByText("MuSkill Aasan");
    expect(StyleSheet.flatten(kicker.props.style).textTransform).not.toBe("uppercase");
  });
});

describe("Badge", () => {
  it("renders the given label", async () => {
    const { getByText } = await render(<Badge label="Verified" />);
    expect(getByText("Verified")).toBeTruthy();
  });
});

describe("ActionButton", () => {
  it("exposes an accessible button role and calls onPress when enabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<ActionButton label="Confirm" onPress={onPress} />);

    const button = getByRole("button", { name: "Confirm" });
    await fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: false }));
  });

  it("does not call onPress and exposes a disabled accessibility state when disabled", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<ActionButton label="Confirm" onPress={onPress} disabled />);

    const button = getByRole("button", { name: "Confirm" });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });
});

describe("SelectableChip", () => {
  it("exposes the selected accessibility state matching the selected prop", async () => {
    const { getByRole, rerender } = await render(
      <SelectableChip label="Urgent" selected={false} onPress={() => {}} />,
    );

    expect(getByRole("button", { name: "Urgent" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );

    await rerender(<SelectableChip label="Urgent" selected onPress={() => {}} />);

    expect(getByRole("button", { name: "Urgent" }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <SelectableChip label="Urgent" selected={false} onPress={onPress} />,
    );

    await fireEvent.press(getByRole("button", { name: "Urgent" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
