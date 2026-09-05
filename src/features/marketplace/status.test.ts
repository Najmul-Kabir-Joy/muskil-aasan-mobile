import { statusTone, verificationLabel } from "@/features/marketplace/status";

describe("statusTone", () => {
  it("maps completed tasks to the success tone", () => {
    expect(statusTone("completed")).toBe("success");
  });

  it("maps cancelled and disputed tasks to the danger tone", () => {
    expect(statusTone("cancelled")).toBe("danger");
    expect(statusTone("disputed")).toBe("danger");
  });

  it("maps hired and completion-requested tasks to the warning tone", () => {
    expect(statusTone("hired")).toBe("warning");
    expect(statusTone("completion requested")).toBe("warning");
  });

  it("falls back to the neutral tone for every other status", () => {
    expect(statusTone("draft")).toBe("neutral");
    expect(statusTone("open")).toBe("neutral");
    expect(statusTone("offer received")).toBe("neutral");
    expect(statusTone("in progress")).toBe("neutral");
  });
});

describe("verificationLabel", () => {
  it("labels a verified worker as Verified", () => {
    expect(verificationLabel("verified")).toBe("Verified");
  });

  it("labels a pending worker as Pending", () => {
    expect(verificationLabel("pending")).toBe("Pending");
  });

  it("labels every other status as Unverified", () => {
    expect(verificationLabel("unverified")).toBe("Unverified");
    expect(verificationLabel("rejected")).toBe("Unverified");
  });
});
