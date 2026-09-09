import { fireEvent, render } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import PostJobScreen from "./PostJobScreen";
import { categories } from "@/data/mock";
import { BRAND_NAME } from "@/shared/constants/brand";

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
// environment. Rendered as a plain View carrying its props (including
// `mode`, so date vs. time pickers are distinguishable by testID, and
// `minimumDate`, so tests can assert past dates are disallowed) with an
// `onChange` handler tests can invoke via `fireEvent(el, "onChange", ...)`.
jest.mock("@react-native-community/datetimepicker", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ mode, ...props }: { mode: string }) => (
      <View testID={`datetimepicker-${mode}`} {...props} />
    ),
  };
});

const mockUseRouter = useRouter as jest.Mock;
const mockRequestCamera = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;

async function fillRequiredFieldsAsRemote(
  getByText: (text: string) => unknown,
  getByPlaceholderText: (text: string) => unknown,
  getByRole: (role: string, options: { name: string | RegExp }) => unknown,
) {
  await fireEvent.changeText(
    getByPlaceholderText("e.g. Need someone to assemble a wardrobe") as never,
    "Assemble a wardrobe",
  );
  await fireEvent.press(getByText("Choose a category") as never);
  await fireEvent.press(getByText(categories[0].label) as never);
  await fireEvent.changeText(
    getByPlaceholderText("Add enough detail so others understand the job clearly.") as never,
    "Flat pack wardrobe, need power drill and basic tools.",
  );
  await fireEvent.press(getByRole("button", { name: /Remote/ }) as never);
  await fireEvent.press(getByRole("button", { name: "Today" }) as never);
  await fireEvent.press(getByRole("button", { name: "৳500" }) as never);
}

describe("PostJobScreen", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace: jest.fn(), push: jest.fn() });
    mockRequestCamera.mockReset();
    mockLaunchCamera.mockReset();
  });

  it("renders the shared Provider app header alongside the local screen header and all form sections", async () => {
    const { getByText } = await render(<PostJobScreen />);

    expect(getByText(BRAND_NAME)).toBeTruthy();
    expect(getByText("Post a Job")).toBeTruthy();
    expect(getByText("Tell people what you need help with")).toBeTruthy();
    expect(getByText(/What do you need help with\?/)).toBeTruthy();
    expect(getByText(/^Category \*/)).toBeTruthy();
    expect(getByText(/^Describe the job/)).toBeTruthy();
    expect(getByText("Add photos")).toBeTruthy();
    expect(getByText(/Where is the job\?/)).toBeTruthy();
    expect(getByText(/When do you need it\?/)).toBeTruthy();
    expect(getByText(/^Your budget/)).toBeTruthy();
  });

  it("uses 'job' rather than 'task' in the description copy", async () => {
    const { getByText, getByPlaceholderText, queryByText } = await render(<PostJobScreen />);

    expect(
      getByPlaceholderText("Add enough detail so others understand the job clearly."),
    ).toBeTruthy();
    expect(getByText("Add enough detail so others understand the job clearly.")).toBeTruthy();
    expect(queryByText(/\btask\b/i)).toBeNull();
  });

  it("has no back button on the local screen header", async () => {
    const { queryByLabelText } = await render(<PostJobScreen />);

    expect(queryByLabelText("Go back")).toBeNull();
  });

  it("the category picker uses the existing app-wide category list, not an invented one", async () => {
    const { getByText, queryByText } = await render(<PostJobScreen />);

    await fireEvent.press(getByText("Choose a category"));
    // The picker is a FlatList — only assert on entries within its default
    // render window rather than every one of the 29 categories.
    expect(getByText(categories[0].label)).toBeTruthy();
    expect(getByText(categories[2].label)).toBeTruthy();

    await fireEvent.press(getByText(categories[2].label));
    expect(queryByText("Choose a category")).toBeNull();
    expect(getByText(categories[2].label)).toBeTruthy();
  });

  it("shows the area selector only for In person, and hides it for Remote", async () => {
    const { getByRole, queryByText, getByText } = await render(<PostJobScreen />);

    expect(getByText(/Area in Dhaka/)).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: /Remote/ }));
    expect(queryByText(/Area in Dhaka/)).toBeNull();

    await fireEvent.press(getByRole("button", { name: /In person/ }));
    expect(getByText(/Area in Dhaka/)).toBeTruthy();
  });

  it("Post Job is disabled until all required fields are filled", async () => {
    const { getByRole, getByText, getByPlaceholderText } = await render(<PostJobScreen />);

    const postButton = getByRole("button", { name: "Post Job →" });
    expect(postButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fillRequiredFieldsAsRemote(getByText, getByPlaceholderText, getByRole);
    expect(postButton.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
  });

  it("requires an area when In person is selected, even with everything else filled", async () => {
    const { getByRole, getByText, getByPlaceholderText } = await render(<PostJobScreen />);

    await fillRequiredFieldsAsRemote(getByText, getByPlaceholderText, getByRole);
    // Switch back to In person without picking an area.
    await fireEvent.press(getByRole("button", { name: /In person/ }));

    expect(getByRole("button", { name: "Post Job →" }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fireEvent.press(getByText("Select area (e.g. Mirpur 10, Dhaka)"));
    await fireEvent.press(getByText("Mirpur 10"));

    expect(getByRole("button", { name: "Post Job →" }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false }),
    );
  });

  it("shows a date and time picker only for Custom timing, and requires both before Post Job enables", async () => {
    const { getByRole, getByText, queryByText, getByTestId } = await render(<PostJobScreen />);

    expect(queryByText("Select date")).toBeNull();
    await fireEvent.press(getByRole("button", { name: "Custom" }));
    expect(getByText("Select date")).toBeTruthy();
    expect(getByText("Select time")).toBeTruthy();

    const postButtonBefore = getByRole("button", { name: "Post Job →" });
    expect(postButtonBefore.props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );

    await fireEvent.press(getByText("Select date"));
    const pickedDate = new Date();
    pickedDate.setDate(pickedDate.getDate() + 3);
    await fireEvent(getByTestId("datetimepicker-date"), "onChange", { type: "set" }, pickedDate);

    await fireEvent.press(getByText("Select time"));
    const pickedTime = new Date();
    pickedTime.setHours(14, 30, 0, 0);
    await fireEvent(getByTestId("datetimepicker-time"), "onChange", { type: "set" }, pickedTime);

    expect(queryByText("Select date")).toBeNull();
    expect(queryByText("Select time")).toBeNull();
  });

  it("passes today (not a future-only or past-inclusive date) as the minimum selectable date, disallowing previous dates", async () => {
    const { getByRole, getByText, getByTestId } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Custom" }));
    await fireEvent.press(getByText("Select date"));

    const expectedMinimum = new Date();
    expectedMinimum.setHours(0, 0, 0, 0);

    expect(getByTestId("datetimepicker-date").props.minimumDate).toEqual(expectedMinimum);
  });

  it("accepts today as a valid custom date", async () => {
    const { getByRole, getByText, queryByText, getByTestId } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Custom" }));
    await fireEvent.press(getByText("Select date"));

    const today = new Date();
    await fireEvent(getByTestId("datetimepicker-date"), "onChange", { type: "set" }, today);

    expect(queryByText("Select date")).toBeNull();
  });

  it("accepts a future custom date", async () => {
    const { getByRole, getByText, queryByText, getByTestId } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Custom" }));
    await fireEvent.press(getByText("Select date"));

    const future = new Date();
    future.setDate(future.getDate() + 3);
    await fireEvent(getByTestId("datetimepicker-date"), "onChange", { type: "set" }, future);

    expect(queryByText("Select date")).toBeNull();
  });

  it("rejects a past custom date even if the native picker emits one", async () => {
    const { getByRole, getByText, getByTestId } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Custom" }));
    await fireEvent.press(getByText("Select date"));

    const past = new Date();
    past.setDate(past.getDate() - 1);
    await fireEvent(getByTestId("datetimepicker-date"), "onChange", { type: "set" }, past);

    // Rejected: the placeholder is still showing, not a formatted past date.
    expect(getByText("Select date")).toBeTruthy();
  });

  it("does not let a rejected past custom date make Post Job valid, even after picking a time", async () => {
    const { getByRole, getByText, getByPlaceholderText, getByTestId } = await render(
      <PostJobScreen />,
    );

    await fillRequiredFieldsAsRemote(getByText, getByPlaceholderText, getByRole);
    await fireEvent.press(getByRole("button", { name: "Custom" }));

    await fireEvent.press(getByText("Select date"));
    const past = new Date();
    past.setDate(past.getDate() - 1);
    await fireEvent(getByTestId("datetimepicker-date"), "onChange", { type: "set" }, past);

    await fireEvent.press(getByText("Select time"));
    const pickedTime = new Date();
    pickedTime.setHours(14, 30, 0, 0);
    await fireEvent(getByTestId("datetimepicker-time"), "onChange", { type: "set" }, pickedTime);

    expect(getByRole("button", { name: "Post Job →" }).props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true }),
    );
  });

  it("selecting a timing option marks it selected", async () => {
    const { getByRole } = await render(<PostJobScreen />);
    const todayButton = getByRole("button", { name: "Today" });

    expect(todayButton.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
    await fireEvent.press(todayButton);
    expect(todayButton.props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it("a budget quick-pick sets the budget input value", async () => {
    const { getByRole, getByDisplayValue } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "৳800" }));

    expect(getByDisplayValue("800")).toBeTruthy();
  });

  it("supports adding multiple photos and enforces the 5-photo maximum", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [{ uri: "file://photo.jpg" }] });
    const { getByText, queryByText, getByRole } = await render(<PostJobScreen />);

    for (let i = 0; i < 5; i += 1) {
      await fireEvent.press(getByRole("button", { name: "Take Photo" }));
    }

    expect(getByText("5/5 photos")).toBeTruthy();
    expect(queryByText("Take Photo")).toBeNull();
    expect(queryByText("Gallery")).toBeNull();
  });

  it("removes an individual photo, which re-enables adding another", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true });
    mockLaunchCamera.mockResolvedValue({ canceled: false, assets: [{ uri: "file://photo.jpg" }] });
    const { getByText, getByRole, getByLabelText } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Take Photo" }));
    await fireEvent.press(getByRole("button", { name: "Take Photo" }));
    expect(getByText("2/5 photos")).toBeTruthy();

    await fireEvent.press(getByLabelText("Remove photo 1"));
    expect(getByText("1/5 photos")).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Take Photo" }));
    expect(getByText("2/5 photos")).toBeTruthy();
  });

  it("does not add a photo when permission is denied", async () => {
    mockRequestCamera.mockResolvedValue({ granted: false });
    const { getByText, getByRole } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Take Photo" }));

    expect(getByText("0/5 photos")).toBeTruthy();
    expect(mockLaunchCamera).not.toHaveBeenCalled();
  });

  it("does not add a photo when the picker is cancelled", async () => {
    mockRequestCamera.mockResolvedValue({ granted: true });
    mockLaunchCamera.mockResolvedValue({ canceled: true, assets: null });
    const { getByText, getByRole } = await render(<PostJobScreen />);

    await fireEvent.press(getByRole("button", { name: "Take Photo" }));

    expect(getByText("0/5 photos")).toBeTruthy();
  });

  it("shows a frontend-only success confirmation on submit, then can navigate back to the neutral Provider home", async () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ back: jest.fn(), replace, push: jest.fn() });
    const { getByRole, getByText, getByPlaceholderText } = await render(<PostJobScreen />);

    await fillRequiredFieldsAsRemote(getByText, getByPlaceholderText, getByRole);
    await fireEvent.press(getByRole("button", { name: "Post Job →" }));

    expect(getByText("Job posted")).toBeTruthy();
    expect(
      getByText("This is a prototype — no real job was created or sent anywhere."),
    ).toBeTruthy();

    await fireEvent.press(getByRole("button", { name: "Back to Home" }));
    expect(replace).toHaveBeenCalledWith("/(poster)");
  });
});
