import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/components/auth/supabase-provider";
import { Folder } from "@/types/folder";

export const useFolderHierarchy = () => {
  const { supabase, user } = useSupabase();

  const { data: folders = [], isLoading } = useQuery<Folder[]>({
    queryKey: ["folders", user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("folders")
        .select("id, name, description, color, user_id, parent_id, created_at, updated_at")
        .eq('user_id', user.id)  
        .order("parent_id", { nullsFirst: true })
        .order("name")
        .returns<Folder[]>();

      if (error) {
        console.error("Error fetching folders:", error);
        throw error;
      }
      
      return buildFolderHierarchy(data);
    },
    enabled: !!user, 
  });

  const buildFolderHierarchy = (folders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];

    // Première passe : créer une map de tous les dossiers
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [], level: 0 });
    });

    // Deuxième passe : construire la hiérarchie en maintenant l'ordre
    folders.forEach((folder) => {
      const currentFolder = folderMap.get(folder.id)!;
      if (folder.parent_id && folderMap.has(folder.parent_id)) {
        const parentFolder = folderMap.get(folder.parent_id)!;
        currentFolder.level = (parentFolder.level || 0) + 1;
        
        // Insérer le dossier au bon endroit dans les enfants du parent
        if (!parentFolder.children) {
          parentFolder.children = [];
        }
        
        // Trouver la bonne position d'insertion pour maintenir l'ordre alphabétique
        const insertIndex = parentFolder.children.findIndex(
          (child) => child.name.localeCompare(currentFolder.name) > 0
        );
        
        if (insertIndex === -1) {
          parentFolder.children.push(currentFolder);
        } else {
          parentFolder.children.splice(insertIndex, 0, currentFolder);
        }
      } else {
        // Insérer le dossier racine au bon endroit
        const insertIndex = rootFolders.findIndex(
          (root) => root.name.localeCompare(currentFolder.name) > 0
        );
        
        if (insertIndex === -1) {
          rootFolders.push(currentFolder);
        } else {
          rootFolders.splice(insertIndex, 0, currentFolder);
        }
      }
    });

    return rootFolders;
  };

  const flattenFolderHierarchy = (folders: Folder[]): Folder[] => {
    const result: Folder[] = [];
    
    const traverse = (folder: Folder) => {
      result.push(folder);
      if (folder.children?.length) {
        folder.children.forEach(traverse);
      }
    };

    folders.forEach(traverse);
    return result;
  };

  return {
    folders,
    isLoading,
    flattenFolderHierarchy,
  };
};
