import { useState, useMemo } from 'react';
import { useVocabularyStore } from '../useVocabularyStore';
import { usePracticeProjectStore } from '../../practice-projects/usePracticeProjectStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { WordPair } from '../vocabulary.types';

interface ImportTextbookVocabDialogProps {
  selectedWords: { korean: string; indonesian: string; chapter: number; book: number }[];
  onSuccess?: () => void;
  children: React.ReactNode;
}

const ImportTextbookVocabDialog = ({
  selectedWords,
  onSuccess,
  children,
}: ImportTextbookVocabDialogProps) => {
  const [open, setOpen] = useState(false);
  const [importMode, setImportMode] = useState<'newSet' | 'existingSet'>('newSet');
  const [newSetName, setNewSetName] = useState('');
  const [existingSetId, setExistingSetId] = useState('');
  const [shouldAddToProject, setShouldAddToProject] = useState(true);
  const [projectId, setProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const { vocabularySets, addVocabularySet } = useVocabularyStore();
  const { projects, addProject, addSetsToProject } = usePracticeProjectStore();

  // Suggest a default set name based on the selected words
  const defaultSetName = useMemo(() => {
    if (selectedWords.length === 0) return '';
    
    // Check if all selected words are from the same chapter
    const chapters = Array.from(new Set(selectedWords.map(w => w.chapter)));
    const books = Array.from(new Set(selectedWords.map(w => w.book)));
    
    let suffix = '';
    if (books.length === 1 && chapters.length === 1) {
      suffix = `Jilid ${books[0]} Bab ${chapters[0]}`;
    } else if (books.length === 1) {
      suffix = `Jilid ${books[0]} Bab ${Math.min(...chapters)}-${Math.max(...chapters)}`;
    } else {
      suffix = `Jilid 1 & 2`;
    }
    
    return `Kosakata Buku (${suffix}) - ${new Date().toLocaleDateString('id-ID')}`;
  }, [selectedWords]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Initialize forms
      setNewSetName(defaultSetName);
      setImportMode('newSet');
      setExistingSetId(vocabularySets[0]?.id || '');
      setShouldAddToProject(true);
      setProjectId(projects[0]?.id || 'newProject');
      setNewProjectName('Proyek Belajar Standard');
    }
  };

  const handleImport = () => {
    if (selectedWords.length === 0) {
      toast.warning('Pilih kosakata terlebih dahulu sebelum mengimpor.');
      return;
    }

    // Map selected words to WordPair structure without IDs
    const mappedWords: Omit<WordPair, 'id'>[] = selectedWords.map(w => ({
      bahasaA: w.korean,
      bahasaB: w.indonesian,
      createdAt: new Date().toISOString(),
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
      history: [],
    }));

    if (importMode === 'newSet') {
      const setName = newSetName.trim() || defaultSetName;
      const oldSetIds = new Set(vocabularySets.map(s => s.id));

      // Call store action
      addVocabularySet(setName, mappedWords);

      // Link to project (deferred to allow state update to persist first)
      setTimeout(() => {
        const currentSets = useVocabularyStore.getState().vocabularySets;
        const newSet = currentSets.find(s => !oldSetIds.has(s.id));

        if (newSet && shouldAddToProject) {
          if (projectId === 'newProject') {
            const projName = newProjectName.trim() || `Proyek ${setName}`;
            addProject(projName, [newSet.id]);
          } else if (projectId) {
            addSetsToProject(projectId, [newSet.id]);
          }
        }
      }, 100);
    } else {
      // Add to existing set
      if (!existingSetId) {
        toast.error('Silakan pilih set kosakata yang sudah ada.');
        return;
      }

      const targetSet = vocabularySets.find(s => s.id === existingSetId);
      if (!targetSet) {
        toast.error('Set kosakata tidak ditemukan.');
        return;
      }

      const updatedSets = vocabularySets.map(set => {
        if (set.id === existingSetId) {
          const newWordsWithIds = mappedWords.map(w => ({
            ...w,
            id: `${w.bahasaA}-${new Date().getTime()}-${Math.random()}`,
          }));
          return {
            ...set,
            words: [...set.words, ...newWordsWithIds],
          };
        }
        return set;
      });

      // Directly update the store state
      useVocabularyStore.setState({ vocabularySets: updatedSets });
      toast.success(
        `${selectedWords.length} kata berhasil ditambahkan ke set "${targetSet.name}".`
      );
    }

    setOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Impor Kosakata ke Set Latihan</DialogTitle>
          <DialogDescription>
            Ekspor {selectedWords.length} kata yang Anda pilih ke sistem latihan kustom Katakosa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Radio Group for Mode Selection */}
          <RadioGroup
            value={importMode}
            onValueChange={(val: 'newSet' | 'existingSet') => setImportMode(val)}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="newSet"
                id="mode-new"
                className="peer sr-only"
              />
              <Label
                htmlFor="mode-new"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center"
              >
                <span className="font-semibold text-sm">Buat Set Baru</span>
                <span className="text-xs text-muted-foreground mt-1">Buat wadah baru untuk kata-kata ini</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="existingSet"
                id="mode-existing"
                className="peer sr-only"
                disabled={vocabularySets.length === 0}
              />
              <Label
                htmlFor="mode-existing"
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center ${
                  vocabularySets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="font-semibold text-sm">Tambahkan ke Set Lain</span>
                <span className="text-xs text-muted-foreground mt-1">Gabungkan ke set yang sudah Anda miliki</span>
              </Label>
            </div>
          </RadioGroup>

          {/* New Set Form */}
          {importMode === 'newSet' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <Label htmlFor="set-name">Nama Set Kosakata</Label>
                <Input
                  id="set-name"
                  value={newSetName}
                  onChange={e => setNewSetName(e.target.value)}
                  placeholder="Masukkan nama set kosakata..."
                />
              </div>

              {/* Add to Project Options */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/40">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="add-to-project"
                    checked={shouldAddToProject}
                    onCheckedChange={(checked) => setShouldAddToProject(!!checked)}
                  />
                  <Label
                    htmlFor="add-to-project"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Hubungkan langsung ke Proyek Latihan
                  </Label>
                </div>

                {shouldAddToProject && (
                  <div className="space-y-3 pl-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1.5">
                      <Label htmlFor="project-select" className="text-xs text-muted-foreground">Pilih Proyek Latihan</Label>
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger id="project-select">
                          <SelectValue placeholder="Pilih Proyek..." />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="newProject">+ Buat Proyek Baru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {projectId === 'newProject' && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <Label htmlFor="new-project-name" className="text-xs text-muted-foreground">Nama Proyek Baru</Label>
                        <Input
                          id="new-project-name"
                          value={newProjectName}
                          onChange={e => setNewProjectName(e.target.value)}
                          placeholder="Nama proyek baru..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Existing Set Form */}
          {importMode === 'existingSet' && vocabularySets.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <Label htmlFor="existing-set-select">Pilih Set Kosakata</Label>
              <Select value={existingSetId} onValueChange={setExistingSetId}>
                <SelectTrigger id="existing-set-select">
                  <SelectValue placeholder="Pilih Set..." />
                </SelectTrigger>
                <SelectContent>
                  {vocabularySets.map(set => (
                    <SelectItem key={set.id} value={set.id}>
                      {set.name} ({set.words.length} kata)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={selectedWords.length === 0}>
            Impor {selectedWords.length} Kata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTextbookVocabDialog;
