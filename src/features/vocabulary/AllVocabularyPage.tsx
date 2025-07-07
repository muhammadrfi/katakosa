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

const AllVocabularyPage = () => {
  const { vocabularySets, removeVocabularySet, editVocabularySet, removeWord, editWord, addWordToSet, addVocabularySet, loading, resetSrsProgress, resetSrsSetProgress } = useVocabularyStore();
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedVocabularySet, setSelectedVocabularySet] = useState<VocabularySet | null>(null);

  // Placeholder for onSetSelectionChange, as it's required by VocabularySetList but not used in AllVocabularyPage
  const handleSetSelectionChange = (setId: string, isSelected: boolean) => {
    // Implement selection logic if needed in the future
    console.log(`Set ${setId} selection changed to ${isSelected}`);
  };

  if (loading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Semua Kosakata</h1>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Daftar Kosakata</CardTitle>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button 
              onClick={() => setIsAddSetDialogOpen(true)} 
              variant="outline"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Set Baru
            </Button>
            <ExcelImporter />
          </div>
        </CardHeader>
        <CardContent>
          <VocabularySetList
            sets={vocabularySets}
            selectedSetIds={[]}
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
            onResetSrs={resetSrsProgress}
            onResetSrsSet={resetSrsSetProgress}
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
    </div>
  );
};

export default AllVocabularyPage;