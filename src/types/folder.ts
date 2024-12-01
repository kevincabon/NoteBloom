export interface Folder {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  user_id: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  // Propriétés pour l'interface utilisateur
  children?: Folder[];
  level?: number;
  isExpanded?: boolean;
  isVirtual?: boolean;
}
