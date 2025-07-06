
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeProject } from './usePracticeProjectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, Pencil } from 'lucide-react';

interface PracticeProjectListProps {
  projects: PracticeProject[];
  onRemoveProject: (projectId: string) => void;
  onEditProject: (project: PracticeProject) => void;
}

const PracticeProjectList = ({ projects, onRemoveProject, onEditProject }: PracticeProjectListProps) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<PracticeProject | null>(null);

  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>Anda belum memiliki proyek latihan.</p>
        <p className="text-sm mt-1">Buat proyek baru dengan memilih set kosakata di bawah.</p>
      </div>
    );
  }

  const handleStartPractice = (project: PracticeProject) => {
    navigate(`/practice/${project.id}`);
  };

  const confirmDelete = (project: PracticeProject) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (projectToDelete) {
      onRemoveProject(projectToDelete.id);
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-200">
            <div>
              <CardHeader>
                <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
                <CardDescription>{project.setIds.length} set kosakata</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Dibuat: {new Date(project.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </div>
            <CardFooter className="flex flex-wrap justify-between items-center pt-4 gap-2">
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEditProject(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => confirmDelete(project)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleStartPractice(project)}>Mulai Latihan</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proyek "{projectToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus proyek ini secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Ya, Hapus Proyek
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PracticeProjectList;
