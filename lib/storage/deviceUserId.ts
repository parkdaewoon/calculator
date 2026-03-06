export function getOrCreateDeviceUserId() {
  if (typeof window === "undefined") return "";

  const key = "gov_note_user_id";
  let v = localStorage.getItem(key);

  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }

  return v;
}