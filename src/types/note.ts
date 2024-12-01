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
  images: string[] | null;
  folder_id: string | null;
  audio_url: string | null;
  folder_name?: string;
  folder_color?: string;
  user_id: string | null;
  owner?: string;
  tags?: Tag[];
}