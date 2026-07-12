// VIT's Google Workspace sets each student's display name to something like
// "Krishil Nilesh Modi 25BDE0094" — the registration number is baked into
// the name Google hands us, not a separate field we can just omit. Since we
// can't change what Google sends, we strip it out wherever a name is shown
// to other students: any token that contains a digit (registration numbers,
// roll numbers, batch codes) is dropped, keeping only the actual name parts.
export function displayName(rawName: string): string {
  const cleaned = rawName
    .split(/\s+/)
    .filter((word) => !/\d/.test(word))
    .join(" ")
    .trim();

  // Fallback for the rare case a name is entirely numeric/alphanumeric —
  // better to show something than an empty string.
  return cleaned || rawName;
}
