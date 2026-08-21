const ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export function escapeText(value: string): string {
  return value
    .replace(ILLEGAL, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}
