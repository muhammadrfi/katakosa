
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
import { WordPair } from '../vocabulary.types';
import { PlusCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface AddVocabularySetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSet: (setName: string, words: Omit<WordPair, 'id'>[]) => void;
}

const AddVocabularySetDialog = ({ isOpen, onClose, onAddSet }: AddVocabularySetDialogProps) => {
  const [setName, setSetName] = useState('');
  const [words, setWords] = useState<Omit<WordPair, 'id'>[]>([{ bahasaA: '', bahasaB: '', interval: 0, repetition: 0, easeFactor: 2.5 }]);

  const handleAddWordPair = () => {
    setWords([...words, { bahasaA: '', bahasaB: '' }]);
  };

  const handleWordChange = (index: number, field: keyof Omit<WordPair, 'id'>, value: string) => {
    const newWords = [...words];
    newWords[index][field] = value;
    setWords(newWords);
  };

  const handleRemoveWordPair = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
  };

  const handleSave = () => {
    if (!setName.trim()) {
      toast.error("Nama set tidak boleh kosong.");
      return;
    }
    const filteredWords = words.filter(word => word.bahasaA.trim() && word.bahasaB.trim());
    if (filteredWords.length === 0) {
      toast.error("Setidaknya satu pasangan kata harus diisi.");
      return;
    }
    onAddSet(setName.trim(), filteredWords);
    setSetName('');
    setWords([{ bahasaA: '', bahasaB: '' }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tambah Set Kosakata Baru</DialogTitle>
          <DialogDescription>
            Buat set kosakata baru dengan menambahkan nama dan pasangan kata.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow overflow-hidden">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="set-name" className="text-right">
              Nama Set
            </Label>
            <Input
              id="set-name"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="Contoh: Kosakata Bab 1"
              className="col-span-3"
            />
          </div>

          <Label className="text-right mt-4">Pasangan Kata</Label>
          <ScrollArea className="flex-grow pr-4">
            {words.map((word, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Bahasa A (e.g., house)"
                  value={word.bahasaA}
                  onChange={(e) => handleWordChange(index, 'bahasaA', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Bahasa B (e.g., rumah)"
                  value={word.bahasaB}
                  onChange={(e) => handleWordChange(index, 'bahasaB', e.target.value)}
                  className="flex-1"
                />
                {words.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveWordPair(index)}>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" onClick={handleAddWordPair}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Pasangan Kata
            </Button>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan Set</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVocabularySetDialog;
