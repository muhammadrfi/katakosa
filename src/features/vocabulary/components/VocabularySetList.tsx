
import { VocabularySet, WordPair } from '../vocabulary.types';
import { Accordion } from "@/components/ui/accordion";
import VocabularySetItem from './VocabularySetItem';

interface VocabularySetListProps {
  sets: VocabularySet[];
  selectedSetIds: string[];
  onSetSelectionChange: (setId: string, isSelected: boolean) => void;
  onRemoveSet: (setId: string) => void;
  onRemoveWord: (wordId: string) => void;
  onEditSet: (setId: string, newName: string) => void;
  onEditWord: (wordId: string, newWord: { bahasaA: string; bahasaB: string }) => void;
  onAddWord: (setId: string, newWord: Omit<WordPair, 'id'>) => void;
  onViewDetails: (set: VocabularySet) => void;
}

const VocabularySetList = (props: VocabularySetListProps) => {
  const { sets, selectedSetIds, onSetSelectionChange, ...rest } = props;

  if (sets.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <h3 className="text-lg font-semibold">Belum Ada Set Kosakata</h3>
        <p className="mt-2 text-sm">Mulai belajar dengan mengimpor atau membuat set kosakata baru.</p>
        {/* Di sini bisa ditambahkan tombol untuk aksi impor/buat jika ada */}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {sets.map((set) => (
        <VocabularySetItem
          key={set.id}
          set={set}
          isSelected={selectedSetIds.includes(set.id)} // Kirim status terpilih
          onSelectionChange={onSetSelectionChange} // Kirim handler
          {...rest} // Kirim sisa props
        />
      ))}
    </Accordion>
  );
};

export default VocabularySetList;
