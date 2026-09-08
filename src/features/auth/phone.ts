// Bangladesh mobile numbers are 10 digits after the +880 country code and
// start with 1 (e.g. locally dialed 017XXXXXXXX == +880 17XXXXXXXX). Users
// often type the leading 0 out of habit, so strip it — the stored/compared
// value is always the normalized 10-digit form, with no leading 0 and no
// redundant "+880" baked in.
export function normalizeBangladeshPhone(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

// UI-only validity check — no real carrier/number-lookup service exists.
export function isValidBangladeshPhone(phone: string): boolean {
  return phone.length === 10 && phone.startsWith("1");
}
