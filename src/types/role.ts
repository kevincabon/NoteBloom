export type UserRole = 'user' | 'vip' | 'admin' | 'superadmin';

export interface RoleLimits {
  role: UserRole;
  max_root_folders: number | null;
  max_subfolders: number | null;
  max_tags: number | null;
  max_notes: number | null;
  max_file_size: number | null;
  features: {
    export_pdf?: boolean;
    priority_support?: boolean;
    admin_panel?: boolean;
    system_settings?: boolean;
  };
  created_at: string;
  updated_at: string;
}
