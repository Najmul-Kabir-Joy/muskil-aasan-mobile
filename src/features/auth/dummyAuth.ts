// There is no backend yet, so phone/OTP verification is entirely simulated:
// any 4-digit code is accepted, and this one hardcoded phone number is the
// only one treated as an existing account — everything else is a new user.
// See docs/engineering/domain-and-terminology.md.
export const DUMMY_EXISTING_PHONE = "1700000000";

export function isDummyExistingUser(phone: string): boolean {
  return phone === DUMMY_EXISTING_PHONE;
}
