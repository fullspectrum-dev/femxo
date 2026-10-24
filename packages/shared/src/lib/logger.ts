/*
 * Logging without personal data: mobile numbers and emails are masked in
 * any text, and secrets are removed by key, however deep they sit.
 */

const MOBILE = /\b[6-9]\d{9}\b/g;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const SECRET_KEYS = new Set(["password", "otp", "code", "token", "accesstoken", "refreshtoken", "authorization", "cardnumber", "cvv"]);

export function redact<T>(value: T): T {
  if (typeof value === "string") return value.replace(EMAIL, "[email]").replace(MOBILE, "[mobile]") as T;
  if (Array.isArray(value)) return value.map(redact) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, SECRET_KEYS.has(key.toLowerCase()) ? "[redacted]" : redact(entry)])
    ) as T;
  }
  return value;
}

export const logger = {
  info: (message: string, data?: unknown) => console.info(redact(message), ...(data === undefined ? [] : [redact(data)])),
  warn: (message: string, data?: unknown) => console.warn(redact(message), ...(data === undefined ? [] : [redact(data)])),
  error: (message: string, data?: unknown) => console.error(redact(message), ...(data === undefined ? [] : [redact(data)])),
};
