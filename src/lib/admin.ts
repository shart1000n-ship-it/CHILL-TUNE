export function isAdminEmail(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false;
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
  const emails = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return emails.includes(userEmail.toLowerCase());
}


