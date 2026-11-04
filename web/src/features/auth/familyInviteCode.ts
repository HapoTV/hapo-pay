const FAMILY_INVITE_CODE_KEY = "hapo-family-invite-code";

export function createDemoFamilyInviteCode() {
  return `HAPOFAM-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function saveDemoFamilyInviteCode(code: string) {
  localStorage.setItem(FAMILY_INVITE_CODE_KEY, code);
}

export function getDemoFamilyInviteCode() {
  return localStorage.getItem(FAMILY_INVITE_CODE_KEY);
}
