
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

        if (json.length === 0) {
          toast.warning("File kosong.");
          return;
        }

        // Fungsi deteksi apakah baris pertama adalah header
        const isHeaderRow = (row: ExcelRow): boolean => {
          if (!row || row.length < 2) return false;
          const col1 = String(row[0] || '').toLowerCase().trim();
          const col2 = String(row[1] || '').toLowerCase().trim();
          
          const headerKeywords = [
            'bahasaa', 'bahasab', 'korea', 'indonesia', 'english', 'word', 'translation',
            'arti', 'makna', 'kosakata', 'term', 'definition', 'vocab', '단어', '뜻', 
            '번호', 'no', 'number', 'indonesian', 'korean'
          ];
          
          return headerKeywords.includes(col1) || headerKeywords.includes(col2);
        };

        const startsFromIndex = isHeaderRow(json[0]) ? 1 : 0;
        const rows = json.slice(startsFromIndex);
        
        const newWords = rows
          .map(row => {
            if (!row || row.length === 0) return null;
            
            // Deteksi jika kolom pertama berisi nomor urut (angka) dan ada kolom penjelas di kolom ke-3
            const isFirstColumnNumber = typeof row[0] === 'number' || 
              (!isNaN(Number(row[0])) && String(row[0]).trim() !== '' && row.length > 2);
            
            const bahasaA = isFirstColumnNumber ? String(row[1] || '') : String(row[0] || '');
            const bahasaB = isFirstColumnNumber ? String(row[2] || '') : String(row[1] || '');
            
            return {
              bahasaA: bahasaA.trim(),
              bahasaB: bahasaB.trim(),
              interval: 0,
              repetition: 0,
              easeFactor: 2.5,
            };
          })
          .filter((word): word is { bahasaA: string; bahasaB: string; interval: number; repetition: number; easeFactor: number } => 
            word !== null && word.bahasaA !== '' && word.bahasaB !== ''
          );

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

  const handleDownloadTemplate = () => {
    try {
      const headers = [["bahasaA", "bahasaB"]];
      const sampleRows = [
        ["cat", "kucing"],
        ["dog", "anjing"],
        ["apple", "apel"]
      ];
      const data = [...headers, ...sampleRows];
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Katakosa Template");
      XLSX.writeFile(wb, "Template_Katakosa.xlsx");
      toast.success("Template Excel berhasil diunduh.");
    } catch (error) {
      console.error("Gagal membuat template Excel:", error);
      toast.error("Gagal mengunduh template Excel.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <Button onClick={handleButtonClick} size="lg" className="w-full sm:w-auto">
          <Upload className="mr-2 h-5 w-5" />
          Impor dari Excel
        </Button>
        <Button onClick={handleDownloadTemplate} variant="outline" size="lg" className="w-full sm:w-auto">
          Unduh Template Excel
        </Button>
      </div>

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
