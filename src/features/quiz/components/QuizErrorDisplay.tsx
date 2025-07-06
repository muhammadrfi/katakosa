import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizErrorDisplayProps {
  message: string;
}

const QuizErrorDisplay: React.FC<QuizErrorDisplayProps> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
      <Card>
        <CardHeader>
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Kosakata Tidak Cukup</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/latihan/proyek/baru')}>Pilih Set Kosakata</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizErrorDisplay;