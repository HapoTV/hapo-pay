const FAMILY_INVITE_CODE_KEY = "hapo-family-invite-code";

export function createFamilyInviteCode() {
  return `HAPOFAM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function saveFamilyInviteCode(code: string) {
  localStorage.setItem(FAMILY_INVITE_CODE_KEY, code);
}

export function getFamilyInviteCode() {
  const code = localStorage.getItem(FAMILY_INVITE_CODE_KEY);
  if (!code) return null;
  if (/^HAPOFAM-\d{4}$/.test(code)) return code;

  localStorage.removeItem(FAMILY_INVITE_CODE_KEY);
  return null;
}

export function getOrCreateFamilyInviteCode() {
  const existingCode = getFamilyInviteCode();
  if (existingCode) return existingCode;

  const code = createFamilyInviteCode();
  saveFamilyInviteCode(code);
  return code;
}
