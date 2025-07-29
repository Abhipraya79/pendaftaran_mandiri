export function isValidRekmedParts(parts) {
  return parts.length === 3 && parts.every(p => /^\d{2}$/.test(p));
}
