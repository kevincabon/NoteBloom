export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  links: string[] | null;
  phone: string | null;
  email: string | null;
  is_public: boolean | null;
}