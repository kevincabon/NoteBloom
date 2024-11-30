export interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  links?: string[];
  phone?: string;
  email?: string;
}