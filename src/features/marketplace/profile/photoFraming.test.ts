import { MAX_ZOOM, MIN_ZOOM, constrainFraming, photoLayout } from "./photoFraming";
import type { ProfilePhoto } from "@/types/domain";

// A landscape photo, twice as wide as it is tall.
const PHOTO: ProfilePhoto = {
  uri: "file:///photo.jpg",
  width: 2000,
  height: 1000,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

describe("photoLayout", () => {
  it("scales the photo to just cover the frame and centres it", () => {
    // Square frame: height is the limiting side, so width overflows.
    expect(photoLayout(PHOTO, 100, 100)).toEqual({ width: 200, height: 100, left: -50, top: 0 });
  });

  it("applies zoom and offset as fractions of the frame, so framing survives a resize", () => {
    const framed = { ...PHOTO, zoom: 2, offsetX: 0.25, offsetY: -0.1 };

    const small = photoLayout(framed, 100, 100);
    const large = photoLayout(framed, 300, 300);

    expect(small).toEqual({ width: 400, height: 200, left: -125, top: -60 });
    expect(large.left / 300).toBeCloseTo(small.left / 100);
    expect(large.top / 300).toBeCloseTo(small.top / 100);
  });
});

describe("constrainFraming", () => {
  it("keeps zoom within the allowed range", () => {
    expect(constrainFraming({ ...PHOTO, zoom: 0.2 }, 100, 100).zoom).toBe(MIN_ZOOM);
    expect(constrainFraming({ ...PHOTO, zoom: 99 }, 100, 100).zoom).toBe(MAX_ZOOM);
  });

  it("never lets an empty edge show: offsets stop where the photo meets the frame edge", () => {
    const pushedFarRight = constrainFraming({ ...PHOTO, offsetX: 5, offsetY: 5 }, 100, 100);
    const layout = photoLayout(pushedFarRight, 100, 100);

    // Left edge exactly at the frame's left; no vertical slack at zoom 1.
    expect(layout.left).toBeCloseTo(0);
    expect(pushedFarRight.offsetY).toBe(0);
  });

  it("allows more movement once zoomed in", () => {
    const atFill = constrainFraming({ ...PHOTO, offsetY: 1 }, 100, 100);
    const zoomed = constrainFraming({ ...PHOTO, zoom: 2, offsetY: 1 }, 100, 100);

    expect(atFill.offsetY).toBe(0);
    expect(zoomed.offsetY).toBeCloseTo(0.5);
  });

  it("frames a wide cover banner differently from a square profile photo", () => {
    const cover = constrainFraming({ ...PHOTO, offsetY: 1 }, 390, 128);

    // Width-limited in a 390×128 banner, so the photo can slide vertically.
    expect(cover.offsetY).toBeGreaterThan(0);
  });

  it("recentres a photo with unknown dimensions instead of dividing by zero", () => {
    const unknown = constrainFraming({ ...PHOTO, width: 0, height: 0, offsetX: 3 }, 100, 100);

    expect(unknown.offsetX).toBe(0);
    expect(photoLayout(unknown, 100, 100)).toEqual({ width: 100, height: 100, left: 0, top: 0 });
  });
});
