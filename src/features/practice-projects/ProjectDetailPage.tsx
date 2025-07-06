import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePracticeProjectStore } from './usePracticeProjectStore';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, AlertTriangle, BookCopy } from 'lucide-react';
import { toast } from 'sonner';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const { 
    loading: vocabLoading, 
    getVocabularyBySetIds, 
    getFilteredWords 
  } = useVocabularyStore();
  console.log('ProjectDetailPage rendered');
  console.log('projectId from URL:', projectId);
  console.log('Projects from store:', projects);
  console.log('Projects loading:', projectsLoading);
  console.log('Vocabulary loading:', vocabLoading);
  


  const project = useMemo(() => {
    console.log('Attempting to find project with ID:', projectId);
    console.log('Available projects:', projects);
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  const wordsForPractice = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'all');
  }, [allWordsInProject, getFilteredWords]);



  if (projectsLoading || vocabLoading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }
  
  if (!project) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
         <Card>
            <CardHeader>
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Proyek Tidak Ditemukan</CardTitle>
                <CardDescription>Proyek yang Anda cari tidak ada atau telah dihapus.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => navigate('/latihan')}>Kembali ke Daftar Proyek</Button>
            </CardContent>
         </Card>
       </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate('/latihan')} className="mb-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Daftar Proyek
      </Button>
      <Card>
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            Mulai latihan mencocokkan kata untuk proyek ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild className="w-full mb-6">
            <Link to={`/latihan/${projectId}/kosakata`}>
              <BookCopy className="mr-2" />
              Lihat & Kelola Daftar Kata
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link to={`/practice/${projectId}`}>
              Mulai Latihan
            </Link>
          </Button>
        </CardContent>
      </Card>




    </div>
  );
};

export default ProjectDetailPage;
