import { act, fireEvent, render } from "@testing-library/react-native";
import type { ReactElement } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReferSomeoneSheet } from "./ReferSomeoneSheet";
import { communityTasks, workers } from "@/data/mock";
import type { EligibleReferral } from "@/types/domain";

// `ReferSomeoneSheet` reads insets via `useSafeAreaInsets()`, which throws
// without a `SafeAreaProvider` ancestor — see AppDrawer.test.tsx for
// the same pattern.
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
const eligibleReferrals: EligibleReferral[] = [
  { worker: workers[0], jobTitle: "Ceiling fan repair" },
  { worker: workers[2], jobTitle: "Logo design for home bakery" },
];

describe("ReferSomeoneSheet — eligible state", () => {
  it("shows the job context and every eligible person from previously completed jobs", async () => {
    const { getByText } = await renderSheet(
      <ReferSomeoneSheet
        visible
        onClose={jest.fn()}
        job={job}
        eligibleReferrals={eligibleReferrals}
      />,
    );

    expect(getByText(job.title)).toBeTruthy();
    expect(getByText("People you've worked with (2)")).toBeTruthy();
    expect(getByText(workers[0].name)).toBeTruthy();
    expect(getByText(workers[2].name)).toBeTruthy();
    expect(getByText("Previously helped you with: Ceiling fan repair")).toBeTruthy();
  });

  it("never shows phone numbers, verification badges, or trust wording for a candidate", async () => {
    const { queryByText } = await renderSheet(
      <ReferSomeoneSheet
        visible
        onClose={jest.fn()}
        job={job}
        eligibleReferrals={eligibleReferrals}
      />,
    );

    expect(queryByText(/verified/i)).toBeNull();
    expect(queryByText(/trusted/i)).toBeNull();
    expect(queryByText(/\+880/)).toBeNull();
  });

  it("refers a person immediately with no confirmation step, shows success feedback, and marks them Referred", async () => {
    const { getByRole, getByText, queryByRole } = await renderSheet(
      <ReferSomeoneSheet
        visible
        onClose={jest.fn()}
        job={job}
        eligibleReferrals={eligibleReferrals}
      />,
    );

    await act(async () => {
      await fireEvent.press(getByRole("button", { name: `Refer ${workers[0].name}` }));
    });

    // No intermediate confirmation dialog — the success state is immediate.
    expect(getByText("Profile referred")).toBeTruthy();
    expect(getByRole("button", { name: `${workers[0].name} referred` })).toBeTruthy();
    expect(queryByRole("button", { name: `Refer ${workers[0].name}` })).toBeNull();
  });

  it("prevents a duplicate referral from a repeated tap", async () => {
    const { getByRole } = await renderSheet(
      <ReferSomeoneSheet
        visible
        onClose={jest.fn()}
        job={job}
        eligibleReferrals={[eligibleReferrals[0]]}
      />,
    );

    const referButton = getByRole("button", { name: `Refer ${workers[0].name}` });
    await act(async () => {
      await fireEvent.press(referButton);
    });
    const referredButton = getByRole("button", { name: `${workers[0].name} referred` });
    await act(async () => {
      await fireEvent.press(referredButton);
    });

    // Still exactly one referred button for this worker — the second tap
    // was a no-op (no duplicate referral, no second toast).
    expect(getByRole("button", { name: `${workers[0].name} referred` })).toBeTruthy();
  });

  it("keeps a worker Referred for the job they were referred to, even after opening a different job and coming back", async () => {
    const jobA = communityTasks[0];
    const jobB = communityTasks[1];
    const sheetFor = (job: (typeof communityTasks)[number]) => (
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ReferSomeoneSheet
          visible
          onClose={jest.fn()}
          job={job}
          eligibleReferrals={eligibleReferrals}
        />
      </SafeAreaProvider>
    );

    const { getByRole, rerender } = await render(sheetFor(jobA));

    await act(async () => {
      await fireEvent.press(getByRole("button", { name: `Refer ${workers[0].name}` }));
    });
    expect(getByRole("button", { name: `${workers[0].name} referred` })).toBeTruthy();

    // Open a different job — its own referral state starts fresh.
    await rerender(sheetFor(jobB));
    expect(getByRole("button", { name: `Refer ${workers[0].name}` })).toBeTruthy();

    // Back to Job A — the earlier referral must still be remembered, not
    // wiped just because a different job was opened in between.
    await rerender(sheetFor(jobA));
    expect(getByRole("button", { name: `${workers[0].name} referred` })).toBeTruthy();
  });

  it("closes via the header close button without requiring any other action", async () => {
    const onClose = jest.fn();
    const { getByLabelText } = await renderSheet(
      <ReferSomeoneSheet
        visible
        onClose={onClose}
        job={job}
        eligibleReferrals={eligibleReferrals}
      />,
    );

    await fireEvent.press(getByLabelText("Close Refer Someone"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ReferSomeoneSheet — no eligible people", () => {
  it("shows the no-eligible-people state with no trust/verification wording", async () => {
    const { getByText, getByRole, queryByText } = await renderSheet(
      <ReferSomeoneSheet visible onClose={jest.fn()} job={job} eligibleReferrals={[]} />,
    );

    expect(getByText("No one to refer yet")).toBeTruthy();
    expect(
      getByText(
        "Once you've completed a job with someone through MuSkill Aasan, you'll be able to recommend their profile here.",
      ),
    ).toBeTruthy();
    expect(getByRole("button", { name: "Got it, close" })).toBeTruthy();
    expect(queryByText(/trusted marketplace/i)).toBeNull();
    expect(queryByText(/verified/i)).toBeNull();
  });

  it("Got it, close dismisses the sheet without changing anything", async () => {
    const onClose = jest.fn();
    const { getByRole } = await renderSheet(
      <ReferSomeoneSheet visible onClose={onClose} job={job} eligibleReferrals={[]} />,
    );

    await fireEvent.press(getByRole("button", { name: "Got it, close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
