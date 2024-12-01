export type Profile = {
  username: string | null;
};

export type Feedback = {
  id: string;
  type: string;
  content: string;
  status: string;
  created_at: string;
  user_id: string;
  profile: Profile;
};