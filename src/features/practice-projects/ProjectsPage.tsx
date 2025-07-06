import React, { useState } from 'react';
import { usePracticeProjectStore, PracticeProject } from './usePracticeProjectStore';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore'; // Diperlukan untuk EditProjectDialog
import PracticeProjectList from './PracticeProjectList';
import EditProjectDialog from './EditProjectDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectsPage = () => {
  const { projects, removeProject, editProject } = usePracticeProjectStore();
  const { vocabularySets } = useVocabularyStore(); // Diperlukan untuk EditProjectDialog
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<PracticeProject | null>(null);

  const openEditDialog = (project: PracticeProject) => {
    setProjectToEdit(project);
    setIsEditProjectDialogOpen(true);
  };

  const handleEditProject = (projectId: string, newName: string, newSetIds: string[]) => {
    editProject(projectId, newName, newSetIds);
    setIsEditProjectDialogOpen(false);
    setProjectToEdit(null);
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

      <EditProjectDialog
        isOpen={isEditProjectDialogOpen}
        onClose={() => setIsEditProjectDialogOpen(false)}
        project={projectToEdit}
        allVocabularySets={vocabularySets}
        onSave={handleEditProject}
      />
    </div>
  );
};

export default ProjectsPage;