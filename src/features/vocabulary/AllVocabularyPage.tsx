import React, { useState } from 'react';
import { useVocabularyStore } from './useVocabularyStore';
import VocabularySetList from './components/VocabularySetList';
import AddVocabularySetDialog from './components/AddVocabularySetDialog';
import ExcelImporter from '../excel-importer/ExcelImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import VocabularyDetailPopup from './components/VocabularyDetailPopup';
import { VocabularySet } from './vocabulary.types';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import CreateProjectDialog from '../practice-projects/CreateProjectDialog';

const AllVocabularyPage = () => {
  const { vocabularySets, removeVocabularySet, editVocabularySet, removeWord, editWord, addWordToSet, addVocabularySet, loading } = useVocabularyStore();
  const { addProject } = usePracticeProjectStore();
  
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedVocabularySet, setSelectedVocabularySet] = useState<VocabularySet | null>(null);
  
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);

  const handleSetSelectionChange = (setId: string, isSelected: boolean) => {
    setSelectedSetIds(prev => {
      if (isSelected) {
        return [...prev, setId];
      } else {
        return prev.filter(id => id !== setId);
      }
    });
  };

  const handleCreateProject = (projectName: string) => {
    addProject(projectName, selectedSetIds);
    setSelectedSetIds([]); // Reset selection
    setIsCreateProjectDialogOpen(false);
  };

  if (loading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Semua Kosakata</h1>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Daftar Kosakata</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Centang set kosakata di bawah ini untuk membuat Proyek Latihan baru.</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button 
              onClick={() => setIsAddSetDialogOpen(true)} 
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Set Baru
            </Button>
            <ExcelImporter />
            <Button 
              onClick={() => setIsCreateProjectDialogOpen(true)} 
              disabled={selectedSetIds.length === 0}
            >
              Buat Proyek dari {selectedSetIds.length > 0 ? `${selectedSetIds.length} Set` : 'Set Terpilih'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <VocabularySetList
            sets={vocabularySets}
            selectedSetIds={selectedSetIds}
            onRemoveSet={removeVocabularySet}
            onRemoveWord={removeWord}
            onEditSet={editVocabularySet}
            onEditWord={editWord}
            onAddWord={addWordToSet}
            onSetSelectionChange={handleSetSelectionChange}
            onViewDetails={(set) => {
              setSelectedVocabularySet(set);
              setIsDetailPopupOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <AddVocabularySetDialog
        isOpen={isAddSetDialogOpen}
        onClose={() => setIsAddSetDialogOpen(false)}
        onAddSet={addVocabularySet}
      />

      <VocabularyDetailPopup
        isOpen={isDetailPopupOpen}
        onClose={() => {
          setIsDetailPopupOpen(false);
          setSelectedVocabularySet(null);
        }}
        vocabularySet={selectedVocabularySet}
      />

      <CreateProjectDialog
        isOpen={isCreateProjectDialogOpen}
        onClose={() => setIsCreateProjectDialogOpen(false)}
        onCreate={handleCreateProject}
        selectedSetCount={selectedSetIds.length}
      />
    </div>
  );
};

export default AllVocabularyPage;