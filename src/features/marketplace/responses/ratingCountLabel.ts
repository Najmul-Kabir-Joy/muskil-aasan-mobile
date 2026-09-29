// "19 ratings" / "1 rating" — how many ratings a Job Seeker's Seeker Rating is
// an average of. Shared by the Responses List and Response Detail so the
// singular form can't drift between them.
export function ratingCountLabel(ratingCount: number) {
  return `${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"}`;
}
