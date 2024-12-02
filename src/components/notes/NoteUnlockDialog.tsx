import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNoteEncryption } from '@/hooks/useNoteEncryption';
import { Unlock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface NoteUnlockDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlockSuccess: (decryptedContent: string) => void;
}

export const NoteUnlockDialog = ({
  note,
  isOpen,
  onOpenChange,
  onUnlockSuccess,
}: NoteUnlockDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { decryptContent, hashPassword } = useNoteEncryption();

  const handleUnlock = async () => {
    if (!note.encrypted_content) return;

    try {
      setIsLoading(true);

      // Vérifier d'abord si le hash correspond
      const passwordHash = hashPassword(password);
      if (passwordHash !== note.password_hash) {
        toast({
          title: t('notes.unlock.errors.incorrectPassword'),
          variant: 'destructive',
        });
        return;
      }

      // Déchiffrer le contenu
      const decryptedContent = decryptContent(note.encrypted_content, password);
      if (!decryptedContent) {
        toast({
          title: t('notes.unlock.errors.decryptionFailed'),
          variant: 'destructive',
        });
        return;
      }

      await onUnlockSuccess(decryptedContent);
      
      // Rafraîchir la note
      queryClient.invalidateQueries({ queryKey: ['note', note.id] });
      
      onOpenChange(false);
      toast({
        title: t('notes.unlock.success'),
      });
    } catch (error) {
      console.error('Error unlocking note:', error);
      toast({
        title: t('notes.unlock.errors.unlockError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="w-4 h-4" />
            {t('notes.unlock.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('notes.unlock.description')}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('notes.unlock.password')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('notes.unlock.passwordPlaceholder')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!password || isLoading}
            >
              {t('notes.unlock.title')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
