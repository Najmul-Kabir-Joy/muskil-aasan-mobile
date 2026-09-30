import type { ProfilePhoto } from "@/types/domain";

// The cover banner's height on the profile (Stitch `h-32`). The cover spans
// the full screen width, so the photo editor frames covers at this height too.
export const COVER_HEIGHT = 128;

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Scale at which the photo just covers the frame, before any zoom.
function fillScale(photo: ProfilePhoto, frameWidth: number, frameHeight: number) {
  if (photo.width <= 0 || photo.height <= 0) return 1;
  return Math.max(frameWidth / photo.width, frameHeight / photo.height);
}

/**
 * Where to draw a framed photo inside a `frameWidth` × `frameHeight` box:
 * its rendered size and top-left position (the box clips the rest).
 */
export function photoLayout(photo: ProfilePhoto, frameWidth: number, frameHeight: number) {
  if (photo.width <= 0 || photo.height <= 0) {
    return { width: frameWidth, height: frameHeight, left: 0, top: 0 };
  }
  const scale = fillScale(photo, frameWidth, frameHeight) * photo.zoom;
  const width = photo.width * scale;
  const height = photo.height * scale;
  return {
    width,
    height,
    left: (frameWidth - width) / 2 + photo.offsetX * frameWidth,
    top: (frameHeight - height) / 2 + photo.offsetY * frameHeight,
  };
}

/**
 * Keeps a framing valid: zoom within [MIN_ZOOM, MAX_ZOOM], and the photo
 * always covering the whole frame, so no empty edge can ever show.
 */
export function constrainFraming(
  photo: ProfilePhoto,
  frameWidth: number,
  frameHeight: number,
): ProfilePhoto {
  const zoom = clamp(photo.zoom, MIN_ZOOM, MAX_ZOOM);
  if (photo.width <= 0 || photo.height <= 0 || frameWidth <= 0 || frameHeight <= 0) {
    return { ...photo, zoom, offsetX: 0, offsetY: 0 };
  }
  const scale = fillScale(photo, frameWidth, frameHeight) * zoom;
  const maxOffsetX = (photo.width * scale - frameWidth) / 2 / frameWidth;
  const maxOffsetY = (photo.height * scale - frameHeight) / 2 / frameHeight;
  return {
    ...photo,
    zoom,
    offsetX: clamp(photo.offsetX, -maxOffsetX, maxOffsetX),
    offsetY: clamp(photo.offsetY, -maxOffsetY, maxOffsetY),
  };
}
