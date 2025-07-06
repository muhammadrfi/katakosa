
// src/components/vocabulary/VocabularySetItem.tsx

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Folder, Trash2, Pencil, PlusCircle, MoreHorizontal } from 'lucide-react';

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
  // Hapus props yang sekarang datang dari store
  onRemoveSet: (setId: string) => void;
  onRemoveWord: (wordId: string) => void;
  onEditSet: (setId: string, newName: string) => void;
  onEditWord: (wordId: string, newWord: { bahasaA: string; bahasaB: string }) => void;
  onAddWord: (setId: string, newWord: Omit<WordPair, 'id'>) => void;
}

const VocabularySetItem = ({ set, isSelected, onSelectionChange, onRemoveSet, onRemoveWord, onEditSet, onEditWord, onAddWord }: VocabularySetItemProps) => {
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
        <WordTable words={set.words} onRemoveWord={onRemoveWord} onEditWord={onEditWord} />
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

// Komponen baru untuk aksi (Dropdown/Drawer)
interface SetItemActionsProps {
  set: VocabularySet;
  onEdit: () => void;
  onRemove: () => void;
}

const SetItemActions = ({ set, onEdit, onRemove }: SetItemActionsProps) => {
  const isMobile = useIsMobile();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleRemoveClick = () => {
    setDeleteDialogOpen(true);
    // Menutup drawer jika terbuka di mobile
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{set.name}</DrawerTitle>
              <DrawerDescription>Pilih aksi yang ingin Anda lakukan untuk set ini.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 grid gap-2">
              <Button onClick={() => { onEdit(); setDrawerOpen(false); }} variant="outline" className="w-full justify-start">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Nama Set
              </Button>
              <Button onClick={handleRemoveClick} variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Set
              </Button>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Batal</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Set "{set.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus set ini dan semua ({set.words.length}) kata di dalamnya secara permanen. Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => { onRemove(); setDeleteDialogOpen(false); }} className="bg-destructive hover:bg-destructive/90">
                Ya, Hapus Set
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Nama Set</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleRemoveClick} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Hapus Set</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Set "{set.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus set ini dan semua ({set.words.length}) kata di dalamnya secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onRemove(); setDeleteDialogOpen(false); }} className="bg-destructive hover:bg-destructive/90">
              Ya, Hapus Set
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VocabularySetItem;
