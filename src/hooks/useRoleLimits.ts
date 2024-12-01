import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/components/auth/supabase-provider";
import { RoleLimits } from "@/types/role";

export const useRoleLimits = () => {
  const { supabase } = useSupabase();

  const { data: limits, isLoading } = useQuery<RoleLimits>({
    queryKey: ["role-limits"],
    queryFn: async () => {
      try {
        // Récupérer d'abord le rôle de l'utilisateur
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .returns<{ role: UserRole }>()
          .single();

        if (!profile) throw new Error("Profile not found");

        // Récupérer les limites pour ce rôle
        const { data: roleLimits, error } = await supabase
          .from("role_limits")
          .select(`
            role,
            max_root_folders,
            max_subfolders,
            max_tags,
            max_notes,
            max_file_size,
            features:features::jsonb,
            created_at,
            updated_at
          `)
          .eq("role", profile.role)
          .returns<RoleLimits>()
          .maybeSingle();

        // Si pas de limites trouvées, utiliser les limites par défaut pour le rôle "user"
        if (!roleLimits) {
          return {
            role: profile.role,
            max_root_folders: profile.role === 'user' ? 6 : null,
            max_subfolders: profile.role === 'user' ? 3 : null,
            max_tags: profile.role === 'user' ? 8 : null,
            max_notes: profile.role === 'user' ? 50 : null,
            max_file_size: profile.role === 'user' ? 5 * 1024 * 1024 : null, // 5MB
            features: profile.role === 'user' ? {} : {
              export_pdf: true,
              priority_support: true,
              admin_panel: profile.role === 'admin' || profile.role === 'superadmin',
              system_settings: profile.role === 'superadmin'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as RoleLimits;
        }

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching role limits:", error);
          throw error;
        }

        return roleLimits;
      } catch (error) {
        console.error("Error in role limits query:", error);
        // En cas d'erreur, retourner les limites par défaut pour le rôle "user"
        return {
          role: 'user',
          max_root_folders: 6,
          max_subfolders: 3,
          max_tags: 8,
          max_notes: 50,
          max_file_size: 5 * 1024 * 1024, // 5MB
          features: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as RoleLimits;
      }
    },
    retry: false // Ne pas réessayer en cas d'erreur
  });

  const canCreateMoreTags = (currentCount: number) => {
    const maxTags = limits?.max_tags ?? (limits?.role === 'user' ? 8 : null);
    if (maxTags === null) return true; // Pas de limite
    return currentCount < maxTags;
  };

  const canCreateMoreRootFolders = (currentCount: number) => {
    const maxRootFolders = limits?.max_root_folders ?? (limits?.role === 'user' ? 6 : null);
    if (maxRootFolders === null) return true; // Pas de limite
    return currentCount < maxRootFolders;
  };

  const canCreateMoreSubfolders = (currentCount: number) => {
    const maxSubfolders = limits?.max_subfolders ?? (limits?.role === 'user' ? 3 : null);
    if (maxSubfolders === null) return true; // Pas de limite
    return currentCount < maxSubfolders;
  };

  return {
    limits,
    isLoading,
    // Helper functions pour vérifier facilement les limites
    canCreateMoreRootFolders,
    canCreateMoreSubfolders,
    canCreateMoreTags,
    canCreateMoreNotes: (currentCount: number) => {
      const maxNotes = limits?.max_notes ?? (limits?.role === 'user' ? 50 : null);
      if (maxNotes === null) return true;
      return currentCount < maxNotes;
    },
    hasFeature: (feature: keyof RoleLimits['features']) => {
      return limits?.features[feature] ?? false;
    }
  };
};
