export function getAuthMessage(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/auth\/invalid-email|invalid email/i.test(raw)) return 'Enter a valid email address.';
  if (/auth\/wrong-password|auth\/invalid-credential|wrong password|invalid credential/i.test(raw)) return 'Email or password is not correct.';
  if (/auth\/email-already-in-use|already.*email/i.test(raw)) return 'An account with this email already exists.';
  if (/auth\/weak-password|weak password/i.test(raw)) return 'Use a password with at least 6 characters.';
  if (/auth\/operation-not-allowed|provider.*disabled|not enabled/i.test(raw)) return 'This sign-in option is not enabled yet.';
  if (/auth\/popup-closed-by-user/i.test(raw)) return 'Google sign-in was closed before finishing.';
  return 'Auth could not finish. Try again.';
}
