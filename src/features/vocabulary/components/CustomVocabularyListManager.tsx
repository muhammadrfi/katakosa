import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomVocabularyListManager: React.FC = () => {
  const [vocabularyInput, setVocabularyInput] = useState('');
  const [customLists, setCustomLists] = useState<string[]>([]);

  const handleAddVocabulary = () => {
    if (vocabularyInput.trim()) {
      setCustomLists([...customLists, vocabularyInput.trim()]);
      setVocabularyInput('');
    }
  };

  const handleImportFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Asumsi setiap baris adalah satu item kosakata
        const newWords = content.split('\n').map(word => word.trim()).filter(word => word.length > 0);
        setCustomLists(prev => [...prev, ...newWords]);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambahkan Kosakata Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vocabulary-item">Kosakata/Frasa</Label>
              <Input
                id="vocabulary-item"
                value={vocabularyInput}
                onChange={(e) => setVocabularyInput(e.target.value)}
                placeholder="Contoh: こんにちは - Halo"
              />
            </div>
            <Button onClick={handleAddVocabulary}>Tambahkan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impor dari File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Impor daftar kosakata dari file teks (.txt), satu kosakata per baris.</p>
            <Input type="file" accept=".txt" onChange={handleImportFromFile} />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daftar Kosakata Kustom Anda</CardTitle>
        </CardHeader>
        <CardContent>
          {customLists.length === 0 ? (
            <p className="text-gray-500">Belum ada kosakata kustom. Tambahkan beberapa!</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {customLists.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomVocabularyListManager;
