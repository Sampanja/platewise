/** Locally unique id for records created on the device (diary entries, plans). */
export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
