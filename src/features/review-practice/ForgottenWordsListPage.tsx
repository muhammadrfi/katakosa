
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePracticeProjectStore } from '../../features/practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from '../../features/vocabulary/useVocabularyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, AlertTriangle, BookCopy, FileQuestion, Volume2, Puzzle } from 'lucide-react';
import { WordPair } from '../../features/vocabulary/vocabulary.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ForgottenWordsListPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const {
    loading: vocabLoading,
    getVocabularyBySetIds,
    getFilteredWords,
  } = useVocabularyStore();

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  const forgottenWords = useMemo(() => {
    // Filter for words that have been marked as forgotten (repetition 0, interval > 0)
    // or are due for review soon after being forgotten.
    return getFilteredWords(allWordsInProject, 'forgotten');
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
    <div className="container mx-auto py-12 px-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/latihan/${projectId}`)} className="mb-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Detail Proyek
      </Button>
      <Card>
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle>Kata-kata Lupa: {project.name}</CardTitle>
          <CardDescription>
            Daftar kata-kata yang perlu Anda latih kembali.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgottenWords.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bahasa A</TableHead>
                    <TableHead>Bahasa B</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forgottenWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell>{word.bahasaA}</TableCell>
                      <TableCell>{word.bahasaB}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild>
                  <Link to={`/practice/${projectId}/quiz?srsFilter=forgotten`}>
                    <FileQuestion className="mr-2" /> Latih dengan Kuis
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/practice/${projectId}/flipbook?srsFilter=forgotten`}>
                    <BookCopy className="mr-2" /> Latih dengan Flipbook
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/practice/${projectId}/listening?srsFilter=forgotten`}>
                    <Volume2 className="mr-2" /> Latih dengan Mendengar
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/practice/${projectId}/matching?srsFilter=forgotten`}>
                    <Puzzle className="mr-2" /> Latih dengan Mencocokkan
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">Tidak ada kata yang ditandai lupa dalam proyek ini.</p>
              <Button onClick={() => navigate(`/latihan/${projectId}`)}>Kembali ke Detail Proyek</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgottenWordsListPage;
