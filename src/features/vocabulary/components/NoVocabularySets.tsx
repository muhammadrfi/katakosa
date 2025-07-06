
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useVocabularyStore } from '../useVocabularyStore';

const NoVocabularySets = () => {
  const { addVocabularySet } = useVocabularyStore();
  const [newSetName, setNewSetName] = useState('');

  const handleCreateNewSet = () => {
    if (newSetName.trim()) {
      addVocabularySet(newSetName.trim(), []);
      setNewSetName('');
    }
  };

  return (
    <div className="container mx-auto py-12 px-6 text-center">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Anda Belum Punya Set Kosakata</CardTitle>
          <CardDescription>
            Sepertinya Anda belum mengimpor file kosakata atau membuat set kosakata baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Buat Kosakata Baru</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Kosakata Baru</DialogTitle>
                <DialogDescription>
                  Masukkan nama untuk set kosakata baru Anda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newSetName" className="text-right">
                    Nama Set
                  </Label>
                  <Input
                    id="newSetName"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleCreateNewSet}>Buat</Button>
            </DialogContent>
          </Dialog>
          <Button asChild>
            <Link to="/">Impor Sekarang</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoVocabularySets;
