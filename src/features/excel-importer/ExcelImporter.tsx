
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WordPair } from '../vocabulary/vocabulary.types';


const ExcelImporter = () => {
  const { addVocabularySet } = useVocabularyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parsedWords, setParsedWords] = useState<Omit<WordPair, 'id'>[]>([]);
  const [setName, setSetName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xls|xlsx)$/)) {
      toast.error("Format file tidak valid. Harap unggah file .xls atau .xlsx");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        type ExcelRow = (string | number)[];
        const json = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 });

        if (json.length <= 1) {
          toast.warning("File kosong atau hanya berisi header.");
          return;
        }

        const rows = json.slice(1);
        
        const newWords = rows
          .map(row => ({
            bahasaA: String(row[0] || '').trim(),
            bahasaB: String(row[1] || '').trim(),
            interval: 0,
            repetition: 0,
            easeFactor: 2.5,
          }))
          .filter(word => word.bahasaA && word.bahasaB);

        if (newWords.length === 0) {
          toast.warning("Tidak ada data valid yang ditemukan dalam file.");
          return;
        }

        setParsedWords(newWords);
        const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.') || "Set Baru";
        setSetName(fileNameWithoutExt);
        setIsDialogOpen(true);

      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Terjadi kesalahan saat memproses file. Pastikan formatnya benar.");
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveSet = () => {
    if (!setName.trim()) {
      toast.error("Nama set tidak boleh kosong.");
      return;
    }
    addVocabularySet(setName.trim(), parsedWords);
    // Defer state updates to prevent race conditions with persistence
    setTimeout(() => {
      setIsDialogOpen(false);
      setSetName("");
      setParsedWords([]);
    }, 0);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <Button onClick={handleButtonClick} size="lg">
        <Upload className="mr-2 h-5 w-5" />
        Impor dari Excel
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Beri Nama Set Kosakata</DialogTitle>
            <DialogDescription>
              {parsedWords.length} kata baru akan diimpor. Beri nama untuk set ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSet()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSet}>Simpan Set</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelImporter;
