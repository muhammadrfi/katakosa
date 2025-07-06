
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PracticeProject } from './usePracticeProjectStore';
import { VocabularySet } from '../vocabulary/vocabulary.types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: PracticeProject | null;
  allVocabularySets: VocabularySet[];
  onSave: (projectId: string, newName: string, newSetIds: string[]) => void;
}

const EditProjectDialog = ({ isOpen, onClose, project, allVocabularySets, onSave }: EditProjectDialogProps) => {
  const [projectName, setProjectName] = useState(project?.name || '');
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>(project?.setIds || []);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setSelectedSetIds(project.setIds);
    }
  }, [project]);

  const handleSetSelectionChange = (setId: string, isSelected: boolean) => {
    setSelectedSetIds(prev => {
      if (isSelected) {
        return [...prev, setId];
      } else {
        return prev.filter(id => id !== setId);
      }
    });
  };

  const handleSave = () => {
    if (project && projectName.trim() && selectedSetIds.length > 0) {
      onSave(project.id, projectName.trim(), selectedSetIds);
      onClose();
    }
  };

  if (!project) return null; // Jangan render jika tidak ada proyek yang dipilih

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Proyek Latihan</DialogTitle>
          <DialogDescription>
            Ubah nama proyek atau set kosakata yang termasuk dalam proyek ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project-name" className="text-right">
              Nama Proyek
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div>
            <Label className="text-right">Set Kosakata</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-2">
              {allVocabularySets.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada set kosakata yang tersedia.</p>
              ) : (
                allVocabularySets.map(set => (
                  <div key={set.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`edit-set-${set.id}`}
                      checked={selectedSetIds.includes(set.id)}
                      onCheckedChange={(checked) => handleSetSelectionChange(set.id, !!checked)}
                    />
                    <Label htmlFor={`edit-set-${set.id}`}>{set.name} ({set.words.length} kata)</Label>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={!projectName.trim() || selectedSetIds.length === 0}>Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
