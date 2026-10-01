export function formatPhone(raw) {
  if (!raw || typeof raw !== "string") return raw || "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const number = digits.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  return raw;
}

export function getInitials(name, phone) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
    return initials || "?";
  }
  const digits = (phone || "").replace(/\D/g, "");
  return digits.slice(-2) || "?";
}
