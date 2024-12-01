export interface Tag {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
  created_at: string;
}
