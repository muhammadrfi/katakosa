import React, { useState } from 'react';
import { useVocabularyStore } from './useVocabularyStore';
import VocabularySetList from './components/VocabularySetList';
import AddVocabularySetDialog from './components/AddVocabularySetDialog';
import ExcelImporter from '../excel-importer/ExcelImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const AllVocabularyPage = () => {
  const { vocabularySets, removeVocabularySet, editVocabularySet, removeWord, editWord, addWordToSet, addVocabularySet, loading } = useVocabularyStore();
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);

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
          />
        </CardContent>
      </Card>

      <AddVocabularySetDialog
        isOpen={isAddSetDialogOpen}
        onClose={() => setIsAddSetDialogOpen(false)}
        onAddSet={addVocabularySet}
      />
    </div>
  );
};

export default AllVocabularyPage;