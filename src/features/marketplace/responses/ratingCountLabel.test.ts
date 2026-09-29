import { ratingCountLabel } from "./ratingCountLabel";

describe("ratingCountLabel", () => {
  it("pluralizes a count of ratings", () => {
    expect(ratingCountLabel(19)).toBe("19 ratings");
    expect(ratingCountLabel(0)).toBe("0 ratings");
  });

  it("uses the singular for exactly one rating", () => {
    expect(ratingCountLabel(1)).toBe("1 rating");
  });
});
