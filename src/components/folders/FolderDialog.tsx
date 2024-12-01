import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  folderName: string;
  folderDescription: string;
  folderColor: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
}

export const FolderDialog = ({
  isOpen,
  onOpenChange,
  title,
  folderName,
  folderDescription,
  folderColor,
  onNameChange,
  onDescriptionChange,
  onColorChange,
  onSubmit,
  submitLabel,
}: FolderDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={folderName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Mon dossier"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              value={folderDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Description du dossier..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Couleur</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                id="color"
                value={folderColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-20 h-10 p-1"
              />
              <Input
                type="text"
                value={folderColor}
                onChange={(e) => onColorChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          <Button onClick={onSubmit} className="w-full">
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};