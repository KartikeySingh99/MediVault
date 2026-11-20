import { IDENTITY_TYPES } from "./schema";

export function identityTitle(doc) {
  return doc.type === "other" && doc.label ? doc.label : IDENTITY_TYPES[doc.type];
}

/** Masked display, e.g. "XXXX XXXX 4821" for Aadhaar, "•••• 234F" for others. */
export function maskedNumber(doc) {
  if (!doc.last4) return null;
  return doc.type === "aadhaar" ? `XXXX XXXX ${doc.last4}` : `•••• ${doc.last4}`;
}

/** Whole days from today until an ISO date (negative = past), or null. */
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86_400_000);
}

export function formatRupees(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
