import { User } from "firebase/auth";

// Same admin emails used in the Flutter app and Firestore rules — these
// accounts can edit/delete ANY listing (moderation), not just their own.
export const ADMIN_EMAILS = ["abuman.moa@gmail.com", "abuhuzaif@gmail.com"];

export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
