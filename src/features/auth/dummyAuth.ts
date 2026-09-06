// There is no backend yet, so phone/OTP verification is entirely simulated:
// this one hardcoded phone number is the only one treated as an existing
// account (everything else is a new user), and this one hardcoded 6-digit
// code is the only one treated as correct. See
// docs/engineering/domain-and-terminology.md.
export const DUMMY_EXISTING_PHONE = "1700000000";
export const DUMMY_CORRECT_OTP = "123456";

export function isDummyExistingUser(phone: string): boolean {
  return phone === DUMMY_EXISTING_PHONE;
}

export function isDummyOtpCorrect(code: string): boolean {
  return code === DUMMY_CORRECT_OTP;
}
