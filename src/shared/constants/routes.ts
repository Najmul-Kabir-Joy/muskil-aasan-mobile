// Temporary landing routes for the signup/login prototype flow — see
// docs/engineering/domain-and-terminology.md. Update these constants (not
// scattered literals) if the destinations change.

// A Job Provider preference lands here — the existing "poster" prototype area.
export const PROTOTYPE_PROVIDER_ROUTE = "/(poster)";

// A Job Seeker preference lands here — the Job Seeker shell ("worker" route
// group), whose default destination is its Home.
export const PROTOTYPE_SEEKER_ROUTE = "/(worker)";

// No preference recorded (skipped, deferred, or an existing user with
// nothing on record) defaults to Job Provider — a deliberate product
// decision (2026-09-09), not an accidental fallback. See
// docs/engineering/domain-and-terminology.md.
export const PROTOTYPE_DEFAULT_ROUTE = PROTOTYPE_PROVIDER_ROUTE;
