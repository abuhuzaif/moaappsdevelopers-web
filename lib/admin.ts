import { User } from "firebase/auth";

// Same admin emails used in the Flutter app and Firestore rules — these
// accounts can edit/delete ANY listing (moderation), not just their own.
// First = main admin, the rest are secondary admins.
export const ADMIN_EMAILS = [
  "myksaconnect@gmail.com", // main admin
  "abuman.moa@gmail.com", // secondary
  "abuhuzaif@gmail.com", // secondary
];

export const MAIN_ADMIN = {
  name: "Mohammed Huzaifa Ali",
  title: "Application Developer · MYKSA Connect Manager",
  email: ADMIN_EMAILS[0],
};

export function isAdmin(user: User | null): boolean {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
