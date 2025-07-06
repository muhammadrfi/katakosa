
import React, { useState } from 'react';
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

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectName: string) => void;
  selectedSetCount: number;
}

const CreateProjectDialog = ({ isOpen, onClose, onCreate, selectedSetCount }: CreateProjectDialogProps) => {
  const [projectName, setProjectName] = useState('');

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreate(projectName.trim());
      setProjectName(''); // Reset nama setelah dibuat
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Proyek Latihan Baru</DialogTitle>
          <DialogDescription>
            Anda akan membuat proyek baru dari {selectedSetCount} set kosakata yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="project-name">Nama Proyek</Label>
          <Input
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Contoh: Latihan Harian Bab 1-3"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleCreate} disabled={!projectName.trim()}>Buat Proyek</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
