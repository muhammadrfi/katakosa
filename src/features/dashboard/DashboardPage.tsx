import React, { useState } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore, PracticeProject } from '../practice-projects/usePracticeProjectStore';
import PracticeProjectList from '../practice-projects/PracticeProjectList';
import VocabularySetList from '../vocabulary/components/VocabularySetList';
import CreateProjectDialog from '../practice-projects/CreateProjectDialog';
import EditProjectDialog from '../practice-projects/EditProjectDialog';
import AddVocabularySetDialog from '../vocabulary/components/AddVocabularySetDialog';
import ExcelImporter from '../excel-importer/ExcelImporter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import SrsStatsCard from './components/SrsStatsCard';
import SrsReviewHistoryCard from './components/SrsReviewHistoryCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const { vocabularySets, removeVocabularySet, editVocabularySet, removeWord, editWord, addWordToSet, addVocabularySet, resetAllSrsProgress } = useVocabularyStore();
  const { projects, addProject, removeProject, editProject } = usePracticeProjectStore();
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);
  const [isCreateProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<PracticeProject | null>(null);
  const [isAddSetDialogOpen, setIsAddSetDialogOpen] = useState(false);

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
    setCreateProjectDialogOpen(false); // Tutup dialog
  };

  const handleEditProject = (projectId: string, newName: string, newSetIds: string[]) => {
    editProject(projectId, newName, newSetIds);
    setIsEditProjectDialogOpen(false);
    setProjectToEdit(null);
  };

  const openEditDialog = (project: PracticeProject) => {
    setProjectToEdit(project);
    setIsEditProjectDialogOpen(true);
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Dashboard</h1>

        <div className="mb-8 md:mb-12">
            <SrsStatsCard />
        </div>

        <div className="mb-8 md:mb-12">
            <SrsReviewHistoryCard />
        </div>

        <Card className="mb-8 md:mb-12">
          <CardHeader>
            <CardTitle>Proyek Latihan Saya</CardTitle>
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
            <CardTitle>Semua Set Kosakata</CardTitle>
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
                onClick={() => setCreateProjectDialogOpen(true)} 
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
            />
          </CardContent>
        </Card>

        {/* Kartu Pengaturan Berbahaya */}
        <Card className="mt-8 md:mt-12 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Zona Berbahaya
            </CardTitle>
            <CardDescription>
              Tindakan di bawah ini tidak dapat dibatalkan. Harap berhati-hati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Semua Progres SRS
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda Yakin Ingin Mereset Semua Progres?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini akan mengatur ulang progres belajar (SRS) untuk SEMUA kata dalam aplikasi. Progres Anda akan kembali ke nol. Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllSrsProgress}>Ya, Reset Semua Progres</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-sm text-muted-foreground mt-2">
              Gunakan tombol ini jika Anda ingin memulai kembali proses belajar Anda dari awal.
            </p>
          </CardContent>
        </Card>
      </div>

      <CreateProjectDialog
        isOpen={isCreateProjectDialogOpen}
        onClose={() => setCreateProjectDialogOpen(false)}
        onCreate={handleCreateProject}
        selectedSetCount={selectedSetIds.length}
      />

      <EditProjectDialog
        isOpen={isEditProjectDialogOpen}
        onClose={() => setIsEditProjectDialogOpen(false)}
        project={projectToEdit}
        allVocabularySets={vocabularySets}
        onSave={handleEditProject}
      />

      <AddVocabularySetDialog
        isOpen={isAddSetDialogOpen}
        onClose={() => setIsAddSetDialogOpen(false)}
        onAddSet={addVocabularySet}
      />
    </>
  );
};

export default DashboardPage;
