import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore, PracticeProject } from '../practice-projects/usePracticeProjectStore';
import PracticeProjectList from '../practice-projects/PracticeProjectList';
import VocabularySetList from '../vocabulary/components/VocabularySetList';
import CreateProjectDialog from '../practice-projects/CreateProjectDialog';
import EditProjectDialog from '../practice-projects/EditProjectDialog';
import AddVocabularySetDialog from '../vocabulary/components/AddVocabularySetDialog';
import ExcelImporter from '../excel-importer/ExcelImporter';
import VocabularyDetailPopup from '../vocabulary/components/VocabularyDetailPopup';
import { VocabularySet } from '../vocabulary/vocabulary.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';
import SrsStatsCard from './components/SrsStatsCard';
import SrsReviewHistoryCard from './components/SrsReviewHistoryCard';
import GamificationCard from './components/GamificationCard';
import DailyPracticeHeatmap from './components/DailyPracticeHeatmap';
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

  const [selectedVocabularySet, setSelectedVocabularySet] = useState<VocabularySet | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 md:mb-12">
          <div className="lg:col-span-2">
            <SrsStatsCard />
          </div>
          <div>
            <GamificationCard />
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <DailyPracticeHeatmap />
        </div>

        <div className="mb-8 md:mb-12">
            <SrsReviewHistoryCard />
        </div>

        <Card className="mb-8 md:mb-12 border border-primary/20 bg-primary/5 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 px-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Tryout EPS-TOPIK 1
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Uji kemampuan Anda dengan 300 soal membaca dan mendengar lengkap dari Buku Standard Textbook 1 2024.
              </CardDescription>
            </div>
            <Button asChild className="w-full sm:w-auto font-semibold shrink-0">
              <Link to="/tryout">Mulai Tryout</Link>
            </Button>
          </CardHeader>
        </Card>

        <Card className="mb-8 md:mb-12 bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
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

        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
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
              onViewDetails={(set) => {
                setSelectedVocabularySet(set);
                setIsDetailPopupOpen(true);
              }}
            />
          </CardContent>
        </Card>

        {/* Kartu Pengaturan Berbahaya */}
        <Card className="mt-8 md:mt-12 border-destructive bg-card shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive font-bold text-lg">
              <AlertTriangle className="h-5 w-5" />
              Zona Berbahaya
            </CardTitle>
            <CardDescription className="text-muted-foreground">
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

      <VocabularyDetailPopup
        isOpen={isDetailPopupOpen}
        onClose={() => {
          setIsDetailPopupOpen(false);
          setSelectedVocabularySet(null);
        }}
        vocabularySet={selectedVocabularySet}
      />
    </>
  );
};

export default DashboardPage;
