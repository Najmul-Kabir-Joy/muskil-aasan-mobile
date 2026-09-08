// No default Job Provider vs. Job Seeker home/mode has been decided — see
// docs/engineering/domain-and-terminology.md's "Intentionally undefined"
// list. These are single, clearly-temporary landing routes so the
// signup/login prototype flow has somewhere to go after finishing; none of
// them is a product decision, and nothing should read them as one. Update
// these constants (not scattered literals) once a real default is confirmed.

// A Job Provider preference lands here — the existing "poster" prototype area.
export const PROTOTYPE_PROVIDER_ROUTE = "/(poster)";

// A Job Seeker preference lands here — the existing "worker" prototype area.
export const PROTOTYPE_SEEKER_ROUTE = "/(worker)/jobs";

// No preference (skipped, or an existing user with no stored preference)
// must NOT silently resolve to either mode above — it lands on a neutral,
// prototype-only interstitial that lets the person pick one explicitly.
export const PROTOTYPE_HOME_ROUTE = "/prototype-home";
