import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Copy, Globe, Link, Lock, Mail, X } from "lucide-react";

interface NoteShareDialogProps {
  note: Note | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShareUser {
  id: string;
  email: string;
  username: string | null;
}

export const NoteShareDialog = ({
  note,
  isOpen,
  onOpenChange,
}: NoteShareDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>([]);
  const [shareLink, setShareLink] = useState<{ url: string; expiresAt: string } | null>(null);
  const [linkExpiration, setLinkExpiration] = useState<string>("7days");
  const [isLoading, setIsLoading] = useState(false);
  const [usePassword, setUsePassword] = useState(false);
  const [sharePassword, setSharePassword] = useState("");

  useEffect(() => {
    if (note) {
      setIsPublic(note.is_public || false);
      loadExistingShareLink();
      loadSharedUsers();
    }
  }, [note]);

  useEffect(() => {
    if (note) {
      loadExistingShareLink();
    }
  }, [note]);

  const loadExistingShareLink = async () => {
    if (!note) return;

    try {
      const { data, error } = await supabase
        .rpc('get_note_share_link', {
          p_note_id: note.id
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const url = `${window.location.origin}/shared/${data[0].token}`;
        setShareLink({ url, expiresAt: data[0].expires_at });
      }
    } catch (error) {
      console.error("Error loading share link:", error);
    }
  };

  const loadSharedUsers = async () => {
    if (!note) return;

    try {
      setIsLoading(true);
      const { data: shares, error: sharesError } = await supabase
        .from('note_shares')
        .select('user_id')
        .eq('note_id', note.id);

      if (sharesError) throw sharesError;

      if (shares && shares.length > 0) {
        const userIds = shares.map(share => share.user_id);
        const { data: users, error: usersError } = await supabase
          .from('searchable_profiles')
          .select('id, email, username')
          .in('id', userIds);

        if (usersError) throw usersError;

        if (users) {
          setSharedUsers(users);
        }
      } else {
        setSharedUsers([]);
      }
    } catch (error) {
      console.error('Error loading shared users:', error);
      toast({
        title: t("notes.sharing.errors.loadError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublic = async (checked: boolean) => {
    if (!note) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from("notes")
        .update({ is_public: checked })
        .eq("id", note.id);

      if (error) throw error;

      setIsPublic(checked);
      toast({
        title: checked 
          ? t("notes.sharing.success.madePublic")
          : t("notes.sharing.success.madePrivate"),
      });
    } catch (error) {
      console.error("Error updating note visibility:", error);
      setIsPublic(!checked); // Revert the state
      toast({
        title: t("notes.sharing.errors.visibilityError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWithUser = async () => {
    if (!note || !shareEmail.trim()) return;

    try {
      setIsLoading(true);

      // Rechercher l'utilisateur via la vue searchable_profiles
      const { data: users, error: userError } = await supabase
        .from('searchable_profiles')
        .select('id, email, username')
        .eq('email', shareEmail.trim())
        .single();

      if (userError || !users) {
        console.error('User search error:', userError);
        toast({
          title: t("notes.sharing.errors.userNotFound"),
          variant: "destructive",
        });
        return;
      }

      // Vérifier si la note est déjà partagée avec cet utilisateur
      const { data: existingShare, error: shareError } = await supabase
        .from("note_shares")
        .select("*")
        .eq("note_id", note.id)
        .eq("user_id", users.id)
        .single();

      if (existingShare) {
        toast({
          title: t("notes.sharing.errors.alreadyShared"),
          variant: "destructive",
        });
        return;
      }

      // Créer le partage
      const { error: createError } = await supabase
        .from("note_shares")
        .insert({
          note_id: note.id,
          user_id: users.id,
        });

      if (createError) throw createError;

      setSharedUsers([...sharedUsers, users]);
      setShareEmail("");
      toast({
        title: t("notes.sharing.success.shared"),
      });
    } catch (error) {
      console.error("Error sharing note:", error);
      toast({
        title: t("notes.sharing.errors.shareError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    if (!note) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("note_shares")
        .delete()
        .eq("note_id", note.id)
        .eq("user_id", userId);

      if (error) throw error;

      setSharedUsers(sharedUsers.filter(user => user.id !== userId));
      toast({
        title: t("notes.sharing.success.deleted"),
      });
    } catch (error) {
      console.error("Error removing share:", error);
      toast({
        title: t("notes.sharing.errors.deleteError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!note) return;

    try {
      setIsLoading(true);

      // Rendre la note publique automatiquement
      const { error: updateError } = await supabase
        .from("notes")
        .update({ is_public: true })
        .eq("id", note.id);

      if (updateError) throw updateError;
      setIsPublic(true);

      // Calculer la date d'expiration
      let expiresAt = new Date();
      switch (linkExpiration) {
        case "1hour":
          expiresAt.setHours(expiresAt.getHours() + 1);
          break;
        case "1day":
          expiresAt.setDate(expiresAt.getDate() + 1);
          break;
        case "7days":
          expiresAt.setDate(expiresAt.getDate() + 7);
          break;
        case "30days":
          expiresAt.setDate(expiresAt.getDate() + 30);
          break;
      }

      // Supprimer l'ancien lien de partage s'il existe
      await supabase
        .from("note_share_links")
        .delete()
        .eq("note_id", note.id);

      // Hasher le mot de passe si nécessaire
      let passwordHash = null;
      if (usePassword && sharePassword) {
        const encoder = new TextEncoder();
        const data = encoder.encode(sharePassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // Créer un nouveau lien de partage
      const { data, error } = await supabase
        .from("note_share_links")
        .insert({
          note_id: note.id,
          expires_at: expiresAt.toISOString(),
          token: crypto.randomUUID(),
          password_hash: passwordHash
        })
        .select()
        .single();

      if (error) throw error;

      if (!data || !data.token) {
        throw new Error('No token received from create_share_link');
      }

      const url = `${window.location.origin}/shared/${data.token}`;
      setShareLink({ url, expiresAt: data.expires_at });
      
      // Réinitialiser le formulaire
      setUsePassword(false);
      setSharePassword("");
      
      toast({
        title: t("notes.sharing.success.linkCreated"),
      });
    } catch (error) {
      console.error("Error generating share link:", error);
      toast({
        title: t("notes.sharing.errors.linkError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExpirationText = (expiresAt: string) => {
    try {
      const expiration = new Date(expiresAt);
      if (isNaN(expiration.getTime())) {
        return t("notes.sharing.expirationError");
      }

      const now = new Date();
      const diffInHours = Math.round((expiration.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 0) {
        return t("notes.sharing.expired");
      }
      
      if (diffInHours < 24) {
        return t("notes.sharing.expiresInHours", { hours: Math.max(0, diffInHours) });
      } else {
        const diffInDays = Math.round(diffInHours / 24);
        return t("notes.sharing.expiresInDays", { days: Math.max(0, diffInDays) });
      }
    } catch (error) {
      console.error("Error calculating expiration:", error);
      return t("notes.sharing.expirationError");
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink.url);
      toast({
        title: t("notes.sharing.success.linkCopied"),
      });
    } catch (error) {
      toast({
        title: t("notes.sharing.errors.copyError"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t("notes.sharing.title")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="visibility" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 gap-4">
            <TabsTrigger value="visibility" className="px-3">
              <Globe className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("notes.sharing.public")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="px-3">
              <Mail className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("notes.sharing.shareWithUsers")}</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="px-3">
              <Link className="h-4 w-4 mr-2 shrink-0" />
              <span className="truncate">{t("notes.sharing.generateLink")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visibility" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">
                  {isPublic ? t("notes.sharing.publicNote") : t("notes.sharing.privateNote")}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isPublic
                    ? t("notes.sharing.publicDescription")
                    : t("notes.sharing.privateDescription")}
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={handleTogglePublic}
                disabled={isLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("notes.sharing.userEmailPlaceholder")}
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
              <Button
                onClick={handleShareWithUser}
                disabled={isLoading || !shareEmail.trim()}
              >
                {t("common.share")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t("notes.sharing.sharedWith")}</Label>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                {sharedUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">
                    {t("notes.sharing.noShares")}
                  </p>
                ) : (
                  sharedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {user.username || user.email}
                        </p>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveShare(user.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )))
                }
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              {shareLink ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={shareLink.url} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyShareLink}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getExpirationText(shareLink.expiresAt)}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="space-y-2">
                    <Label>{t("notes.sharing.expiration")}</Label>
                    <Select
                      value={linkExpiration}
                      onValueChange={setLinkExpiration}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1hour">{t("notes.sharing.expirations.1hour")}</SelectItem>
                        <SelectItem value="1day">{t("notes.sharing.expirations.1day")}</SelectItem>
                        <SelectItem value="7days">{t("notes.sharing.expirations.7days")}</SelectItem>
                        <SelectItem value="30days">{t("notes.sharing.expirations.30days")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Switch
                      checked={usePassword}
                      onCheckedChange={setUsePassword}
                    />
                    <Label>{t("notes.sharing.usePassword")}</Label>
                  </div>
                  {usePassword && (
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder={t("notes.sharing.passwordPlaceholder")}
                        value={sharePassword}
                        onChange={(e) => setSharePassword(e.target.value)}
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleGenerateShareLink}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {t("notes.sharing.generateLink")}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
