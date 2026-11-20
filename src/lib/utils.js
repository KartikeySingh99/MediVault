/** Join class names, skipping falsy values. */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO date string as e.g. "12 Nov 2026". */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
