
import { useState, useMemo } from 'react';
import { VocabularySet } from '../vocabulary.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddVocabularyToProjectDialogProps {
  projectId: string;
  allSets: VocabularySet[];
  projectSetIds: string[];
  onAddSets: (projectId: string, setIds: string[]) => void;
  children: React.ReactNode;
}

const AddVocabularyToProjectDialog = ({ projectId, allSets, projectSetIds, onAddSets, children }: AddVocabularyToProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);

  const availableSets = useMemo(() => {
    return allSets.filter(set => !projectSetIds.includes(set.id));
  }, [allSets, projectSetIds]);

  const handleSelectSet = (setId: string) => {
    setSelectedSetIds(prev =>
      prev.includes(setId)
        ? prev.filter(id => id !== setId)
        : [...prev, setId]
    );
  };

  const handleSave = () => {
    if (selectedSetIds.length === 0) {
      toast.warning("Pilih setidaknya satu set untuk ditambahkan.");
      return;
    }
    onAddSets(projectId, selectedSetIds);
    setSelectedSetIds([]);
    setOpen(false);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if(!isOpen) {
          setSelectedSetIds([]);
      }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Tambah Set Kosakata ke Proyek</DialogTitle>
          <DialogDescription>
            Pilih set kosakata yang sudah ada untuk ditambahkan ke proyek ini.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {availableSets.length > 0 ? (
            <ScrollArea className="h-72 w-full rounded-md border">
              <div className="p-4 space-y-4">
                {availableSets.map(set => (
                  <div key={set.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`add-${set.id}`}
                      checked={selectedSetIds.includes(set.id)}
                      onCheckedChange={() => handleSelectSet(set.id)}
                    />
                    <Label
                      htmlFor={`add-${set.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow cursor-pointer"
                    >
                      <p>{set.name}</p>
                      <p className="text-xs text-muted-foreground">{set.words.length} kata</p>
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>Semua set kosakata Anda sudah ada di proyek ini.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={selectedSetIds.length === 0}>
            Tambahkan {selectedSetIds.length > 0 ? `(${selectedSetIds.length})` : ''} Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabularyToProjectDialog;
