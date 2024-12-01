import { FeedbackTable, FoldersTable, NotesTable, ProfilesTable } from './tables';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      feedback: FeedbackTable;
      folders: FoldersTable;
      notes: NotesTable;
      profiles: ProfilesTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}