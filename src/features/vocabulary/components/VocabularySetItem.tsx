
// src/components/vocabulary/VocabularySetItem.tsx

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Folder, Trash2, Pencil, PlusCircle, MoreHorizontal, RotateCcw } from 'lucide-react';

import { VocabularySet, WordPair } from '../vocabulary.types';
import { useIsMobile } from '@/hooks/use-mobile';

// Import komponen UI
import { Button } from '@/components/ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WordTable from './WordTable';

interface VocabularySetItemProps {
  set: VocabularySet;
}

import { Checkbox } from '@/components/ui/checkbox';

interface VocabularySetItemProps {
  set: VocabularySet;
  isSelected: boolean;
  onSelectionChange: (setId: string, isSelected: boolean) => void;
  onRemoveSet: (setId: string) => void;
  onRemoveWord: (wordId: string) => void;
  onEditSet: (setId: string, newName: string) => void;
  onEditWord: (wordId: string, newWord: { bahasaA: string; bahasaB: string }) => void;
  onAddWord: (setId: string, newWord: Omit<WordPair, 'id'>) => void;
  onViewDetails: (set: VocabularySet) => void;
  onResetSrs: (wordId: string) => void; // Add new prop for SRS reset
  onResetSrsSet: (setId: string) => void; // Add new prop for SRS reset per set
}

interface SetItemActionsProps {
  set: VocabularySet;
  onEdit: () => void;
  onRemove: () => void;
  onViewDetails: (set: VocabularySet) => void;
  onResetSrsSet: (setId: string) => void; // Add new prop for SRS reset per set
}

const SetItemActions = ({ set, onEdit, onRemove, onViewDetails, onResetSrsSet }: SetItemActionsProps) => {
  const isMobile = useIsMobile();

  const content = (
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" /> Edit Nama Set
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewDetails(set)}>
        <Folder className="mr-2 h-4 w-4" /> Lihat Detail
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onResetSrsSet(set.id)}>
        <RotateCcw className="mr-2 h-4 w-4" /> Reset SRS Set
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <AlertDialog>
        <AlertDialogAction asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Trash2 className="mr-2 h-4 w-4" /> Hapus Set
          </DropdownMenuItem>
        </AlertDialogAction>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus set ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus set kosakata "{set.name}" dan semua kata di dalamnya secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenuContent>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Aksi untuk {set.name}</DrawerTitle>
            <DrawerDescription>Pilih tindakan yang ingin Anda lakukan.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-1 p-4">
            <Button variant="ghost" className="justify-start" onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Nama Set
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => onViewDetails(set)}>
              <Folder className="mr-2 h-4 w-4" /> Lihat Detail
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => onResetSrsSet(set.id)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset SRS Set
            </Button>
            <AlertDialog>
              <AlertDialogAction asChild>
                <Button variant="ghost" className="justify-start text-destructive hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus Set
                </Button>
              </AlertDialogAction>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda yakin ingin menghapus set ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Ini akan menghapus set kosakata "{set.name}" dan semua kata di dalamnya secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Batal</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      {content}
    </DropdownMenu>
  );
};

const VocabularySetItem = ({ set, isSelected, onSelectionChange, onRemoveSet, onRemoveWord, onEditSet, onEditWord, onAddWord, onViewDetails, onResetSrs, onResetSrsSet }: VocabularySetItemProps) => {
  const [newSetName, setNewSetName] = useState(set.name);
  const [newWord, setNewWord] = useState<Omit<WordPair, 'id'>>({ bahasaA: '', bahasaB: '', interval: 0, repetition: 0, easeFactor: 2.5 });
  const [isAddWordDialogOpen, setAddWordDialogOpen] = useState(false);
  const [isEditSetDialogOpen, setEditSetDialogOpen] = useState(false);

  const handleEditSet = () => {
    const trimmedName = newSetName.trim();
    if (trimmedName && trimmedName !== set.name) {
      onEditSet(set.id, trimmedName);
      toast.success(`Nama set diubah menjadi "${trimmedName}".`);
    }
    setEditSetDialogOpen(false);
  };

  const handleRemoveSet = () => {
    onRemoveSet(set.id);
    // Pesan toast sudah ada di action store
  };

  const handleAddWord = () => {
    if (newWord.bahasaA.trim() && newWord.bahasaB.trim()) {
      onAddWord(set.id, newWord);
      setNewWord({ bahasaA: '', bahasaB: '', interval: 0, repetition: 0, easeFactor: 2.5 });
      setAddWordDialogOpen(false);
    } else {
      toast.error("Kedua kolom harus diisi.");
    }
  };
  
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AccordionItem value={set.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex justify-between items-center w-full pr-4">
          <div className="flex items-center gap-3">
            <div onClick={stopPropagation} className="p-2">
              <Checkbox
                id={`select-set-${set.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  onSelectionChange(set.id, !!checked);
                }}
                aria-label={`Pilih set ${set.name}`}
              />
            </div>
            <Folder className="h-5 w-5 text-primary" />
            <div className='text-left'>
              <p className="font-semibold text-base">{set.name}</p>
              <p className="text-sm text-muted-foreground font-normal">{set.words.length} kata</p>
            </div>
          </div>
          <div onClick={stopPropagation}>
            <SetItemActions 
              set={set} 
              onEdit={() => setEditSetDialogOpen(true)} 
              onRemove={handleRemoveSet}
              onViewDetails={onViewDetails}
              onResetSrsSet={onResetSrsSet}
            />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="px-4 md:px-6 pb-4">
            <Dialog open={isAddWordDialogOpen} onOpenChange={setAddWordDialogOpen}>
                <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Kata
                </Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Kata Baru ke Set "{set.name}"</DialogTitle>
                    <DialogDescription>
                    Masukkan kata atau frasa dalam Bahasa A dan terjemahannya di Bahasa B.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                    <Label htmlFor="bahasaA">Bahasa A</Label>
                    <Input id="bahasaA" value={newWord.bahasaA} onChange={(e) => setNewWord({...newWord, bahasaA: e.target.value})} placeholder="e.g., house" />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="bahasaB">Bahasa B (Terjemahan)</Label>
                    <Input id="bahasaB" value={newWord.bahasaB} onChange={(e) => setNewWord({...newWord, bahasaB: e.target.value})} placeholder="e.g., rumah" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setAddWordDialogOpen(false)}>Batal</Button>
                    <Button type="submit" onClick={handleAddWord}>Tambah Kata</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
       <WordTable
            words={set.words}
            onRemoveWord={onRemoveWord}
            onEditWord={onEditWord}
            onResetSrs={onResetSrs}
          />
      </AccordionContent>

      {/* Dialog Edit dipisahkan agar bisa di-trigger dari mana saja */}
      <Dialog open={isEditSetDialogOpen} onOpenChange={setEditSetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Nama Set</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input 
                id="name" 
                value={newSetName} 
                onChange={(e) => setNewSetName(e.target.value)} 
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleEditSet()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditSetDialogOpen(false)}>Batal</Button>
            <Button type="submit" onClick={handleEditSet}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccordionItem>
  );
};



export default VocabularySetItem;
