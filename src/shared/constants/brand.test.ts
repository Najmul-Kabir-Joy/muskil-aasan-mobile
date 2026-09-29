import { BRAND_NAME } from "./brand";

describe("BRAND_NAME", () => {
  it("is exactly the product's user-facing name", () => {
    // Pinned on purpose: this string is shown to users across the app, so a
    // respelling should be a deliberate change to this test too.
    expect(BRAND_NAME).toBe("MuSkill Aasan");
  });
});
