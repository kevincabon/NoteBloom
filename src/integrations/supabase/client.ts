// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://ilbcouenlibklodworfr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYmNvdWVubGlia2xvZHdvcmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwMDYxMTQsImV4cCI6MjA0ODU4MjExNH0.pYuUBTVMUmBLrVQaZNnA_cLudw-z5xSmHPCXtt1zd6k";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);