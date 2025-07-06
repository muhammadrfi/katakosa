import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePracticeProjectStore } from '../../features/practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from '../../features/vocabulary/useVocabularyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectReviewPracticePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const {
    loading: vocabLoading,
    getVocabularyBySetIds,
    markWordAsRemembered,
    markWordAsForgotten,
    getFilteredWords,
  } = useVocabularyStore();

  const [selectedWord, setSelectedWord] = useState<WordPair | null>(null);

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  const forgottenWords = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'forgotten');
  }, [allWordsInProject, getFilteredWords]);

  const masteredWords = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'mastered');
  }, [allWordsInProject, getFilteredWords]);

  const newWords = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'new');
  }, [allWordsInProject, getFilteredWords]);

  const learningWords = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'learning');
  }, [allWordsInProject, getFilteredWords]);

  const dueWords = useMemo(() => {
    return getFilteredWords(allWordsInProject, 'due');
  }, [allWordsInProject, getFilteredWords]);

  const srsData = useMemo(() => [
    { name: 'Baru', value: newWords.length, color: '#8884d8' },
    { name: 'Sedang Dipelajari', value: learningWords.length, color: '#82ca9d' },
    { name: 'Jatuh Tempo', value: dueWords.length, color: '#ffc658' },
    { name: 'Dikuasai', value: masteredWords.length, color: '#00C49F' },
    { name: 'Lupa', value: forgottenWords.length, color: '#FF8042' },
  ], [newWords.length, learningWords.length, dueWords.length, masteredWords.length, forgottenWords.length]);

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

  const handleWordAction = () => {
    setSelectedWord(null); // Go back to the lists after action
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(`/practice/${projectId}`)} className="mb-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Mode Latihan
      </Button>
      <Card>
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle>Ulasan Proyek: {project.name}</CardTitle>
          <CardDescription>
            Ulas kosakata proyek ini berdasarkan status SRS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8 flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={srsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {srsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Kata yang Lupa ({forgottenWords.length})</h3>
              {forgottenWords.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto p-2 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bahasa A</TableHead>
                        <TableHead>Bahasa B</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forgottenWords.map(word => (
                        <TableRow key={word.id}>
                          <TableCell>{word.bahasaA}</TableCell>
                          <TableCell>{word.bahasaB}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <Link to={`/practice/${projectId}/quiz?srsFilter=forgotten`}>
                      <Button className="w-full">Latih dengan Kuis</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/flipbook?srsFilter=forgotten`}>
                      <Button className="w-full">Latih dengan Flipbook</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/listening?srsFilter=forgotten`}>
                      <Button className="w-full">Latih dengan Mendengar</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/matching?srsFilter=forgotten`}>
                      <Button className="w-full">Latih dengan Mencocokkan</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada kata yang lupa.</p>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Kata yang Ingat ({masteredWords.length})</h3>
              {masteredWords.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto p-2 border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bahasa A</TableHead>
                        <TableHead>Bahasa B</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masteredWords.map(word => (
                        <TableRow key={word.id}>
                          <TableCell>{word.bahasaA}</TableCell>
                          <TableCell>{word.bahasaB}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <Link to={`/practice/${projectId}/quiz?srsFilter=mastered`}>
                      <Button className="w-full">Latih dengan Kuis</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/flipbook?srsFilter=mastered`}>
                      <Button className="w-full">Latih dengan Flipbook</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/listening?srsFilter=mastered`}>
                      <Button className="w-full">Latih dengan Mendengar</Button>
                    </Link>
                    <Link to={`/practice/${projectId}/matching?srsFilter=mastered`}>
                      <Button className="w-full">Latih dengan Mencocokkan</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Tidak ada kata yang ingat.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReviewPracticePage;