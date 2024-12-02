import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNoteEncryption } from '@/hooks/useNoteEncryption';
import { Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface NoteLockDialogProps {
  note: Note;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLockNote: (noteId: string, passwordHash: string, encryptedContent: string) => Promise<void>;
}

export const NoteLockDialog = ({
  note,
  isOpen,
  onOpenChange,
  onLockNote,
}: NoteLockDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { encryptContent, hashPassword } = useNoteEncryption();

  const handleLockNote = async () => {
    if (password !== confirmPassword) {
      toast({
        title: t('notes.lock.errors.passwordMismatch'),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t('notes.lock.errors.passwordTooShort'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const passwordHash = hashPassword(password);
      const encryptedContent = encryptContent(note.content || '', password);
      await onLockNote(note.id, passwordHash, encryptedContent);
      
      // Rafraîchir la note
      queryClient.invalidateQueries({ queryKey: ['note', note.id] });
      
      toast({
        title: t('notes.lock.success'),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error locking note:', error);
      toast({
        title: t('notes.lock.errors.lockError'),
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
            <Lock className="w-4 h-4" />
            {t('notes.lock.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('notes.lock.description')}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('notes.lock.password')}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('notes.lock.passwordPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('notes.lock.confirmPassword')}</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('notes.lock.confirmPasswordPlaceholder')}
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
              onClick={handleLockNote}
              disabled={!password || !confirmPassword || isLoading}
            >
              {t('notes.lock.title')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
