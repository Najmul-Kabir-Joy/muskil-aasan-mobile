import { isValidBangladeshPhone, normalizeBangladeshPhone } from "./phone";

describe("normalizeBangladeshPhone", () => {
  it("strips a leading 0 from a locally-dialed number", () => {
    expect(normalizeBangladeshPhone("01712345678")).toBe("1712345678");
  });

  it("leaves an already-normalized 10-digit number unchanged", () => {
    expect(normalizeBangladeshPhone("1712345678")).toBe("1712345678");
  });

  it("strips non-digit characters", () => {
    expect(normalizeBangladeshPhone("(017) 123-45678")).toBe("1712345678");
  });

  it("caps the result at 10 digits", () => {
    expect(normalizeBangladeshPhone("171234567890000")).toHaveLength(10);
  });
});

describe("isValidBangladeshPhone", () => {
  it("accepts a normalized 10-digit number starting with 1", () => {
    expect(isValidBangladeshPhone("1712345678")).toBe(true);
  });

  it("rejects a number that is too short", () => {
    expect(isValidBangladeshPhone("17123")).toBe(false);
  });

  it("rejects a number that does not start with 1", () => {
    expect(isValidBangladeshPhone("2712345678")).toBe(false);
  });
});
