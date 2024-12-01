export type User = {
  id: string;
  username: string | null;
  email: string;
  role: "user" | "admin" | "superadmin";
  created_at: string;
  last_sign_in_at: string | null;
};
