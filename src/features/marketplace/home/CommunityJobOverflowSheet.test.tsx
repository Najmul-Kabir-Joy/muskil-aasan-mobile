import { fireEvent, render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { Alert, Share } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CommunityJobOverflowSheet } from "./CommunityJobOverflowSheet";
import { communityTasks } from "@/data/mock";

function renderSheet(element: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {element}
    </SafeAreaProvider>,
  );
}

const job = communityTasks[0];

describe("CommunityJobOverflowSheet", () => {
  it("shows exactly Share Job, Report Job, and Cancel — no other actions", async () => {
    const { getByText, queryByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={jest.fn()} job={job} />,
    );

    expect(getByText("Share Job")).toBeTruthy();
    expect(getByText("Report Job")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(queryByText(/save/i)).toBeNull();
    expect(queryByText(/refer someone/i)).toBeNull();
    expect(queryByText(/apply/i)).toBeNull();
    expect(queryByText(/message/i)).toBeNull();
    expect(queryByText(/block/i)).toBeNull();
    expect(queryByText(/hide/i)).toBeNull();
  });

  it("shows the job title and poster context in the header", async () => {
    const { getByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={jest.fn()} job={job} />,
    );

    expect(getByText(job.title)).toBeTruthy();
    expect(getByText(`Posted by ${job.postedBy?.name} · ${job.postedBy?.area}`)).toBeTruthy();
  });

  it("describes Share as sharing text details, not a public job link, since only text is shared", async () => {
    const { getByText, queryByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={jest.fn()} job={job} />,
    );

    expect(getByText("Share this job's details as text")).toBeTruthy();
    expect(queryByText(/public job link/i)).toBeNull();
  });

  it("Share Job invokes the platform share sheet and closes", async () => {
    const shareSpy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
    const onClose = jest.fn();
    const { getByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={onClose} job={job} />,
    );

    await fireEvent.press(getByText("Share Job"));

    expect(shareSpy).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    expect(onClose).toHaveBeenCalledTimes(1);
    shareSpy.mockRestore();
  });

  it("Report Job shows a lightweight local acknowledgement and closes, with no moderation flow", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const onClose = jest.fn();
    const { getByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={onClose} job={job} />,
    );

    await fireEvent.press(getByText("Report Job"));

    // Neutral prototype-scoped wording — never implies a moderation team
    // exists to review the report, since no such backend exists.
    expect(alertSpy).toHaveBeenCalledWith("Job reported", "Report recorded for this prototype.");
    expect(onClose).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it("Cancel closes without side effects", async () => {
    const onClose = jest.fn();
    const { getByText } = await renderSheet(
      <CommunityJobOverflowSheet visible onClose={onClose} job={job} />,
    );

    await fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
