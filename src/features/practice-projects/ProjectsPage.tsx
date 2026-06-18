import React, { useState } from 'react';
import { usePracticeProjectStore, PracticeProject } from './usePracticeProjectStore';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import PracticeProjectList from './PracticeProjectList';
import EditProjectDialog from './EditProjectDialog';
import CreateProjectDialog from './CreateProjectDialog';
import VocabularySetList from '../vocabulary/components/VocabularySetList';
import ExcelImporter from '../excel-importer/ExcelImporter';
import VocabularyDetailPopup from '../vocabulary/components/VocabularyDetailPopup';
import { VocabularySet } from '../vocabulary/vocabulary.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProjectsPage = () => {
  const { projects, removeProject, editProject, addProject } = usePracticeProjectStore();
  const { vocabularySets, removeVocabularySet, editVocabularySet, removeWord, editWord, addWordToSet } = useVocabularyStore();
  
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<PracticeProject | null>(null);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  
  const [selectedVocabularySet, setSelectedVocabularySet] = useState<VocabularySet | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

  const openEditDialog = (project: PracticeProject) => {
    setProjectToEdit(project);
    setIsEditProjectDialogOpen(true);
  };

  const handleEditProject = (projectId: string, newName: string, newSetIds: string[]) => {
    editProject(projectId, newName, newSetIds);
    setIsEditProjectDialogOpen(false);
    setProjectToEdit(null);
  };

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
    setSelectedSetIds([]); // Kosongkan pilihan setelah proyek dibuat
    setIsCreateProjectDialogOpen(false); // Tutup dialog
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Proyek Latihan Saya</h1>

      <Card className="mb-8 md:mb-12">
        <CardHeader>
          <CardTitle>Daftar Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          <PracticeProjectList 
            projects={projects} 
            onRemoveProject={removeProject} 
            onEditProject={openEditDialog}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Pilih Set Kosakata untuk Proyek Baru</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Centang satu atau lebih set kosakata di bawah ini, lalu klik tombol "Buat Proyek".</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
            <ExcelImporter />
            <Button 
              onClick={() => setIsCreateProjectDialogOpen(true)} 
              disabled={selectedSetIds.length === 0}
              className="w-full sm:w-auto"
            >
              Buat Proyek dari {selectedSetIds.length > 0 ? `${selectedSetIds.length} Set` : 'Set Terpilih'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <VocabularySetList
            sets={vocabularySets}
            selectedSetIds={selectedSetIds}
            onSetSelectionChange={handleSetSelectionChange}
            onRemoveSet={removeVocabularySet}
            onRemoveWord={removeWord}
            onEditSet={editVocabularySet}
            onEditWord={editWord}
            onAddWord={addWordToSet}
            onViewDetails={(set) => {
              setSelectedVocabularySet(set);
              setIsDetailPopupOpen(true);
            }}
          />
        </CardContent>
      </Card>

      <EditProjectDialog
        isOpen={isEditProjectDialogOpen}
        onClose={() => setIsEditProjectDialogOpen(false)}
        project={projectToEdit}
        allVocabularySets={vocabularySets}
        onSave={handleEditProject}
      />

      <CreateProjectDialog
        isOpen={isCreateProjectDialogOpen}
        onClose={() => setIsCreateProjectDialogOpen(false)}
        onCreate={handleCreateProject}
        selectedSetCount={selectedSetIds.length}
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

export default ProjectsPage;