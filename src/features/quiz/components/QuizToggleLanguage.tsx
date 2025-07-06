import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface QuizToggleLanguageProps {
  swapLanguages: boolean;
  onToggleSwapLanguage: (checked: boolean) => void;
}

const QuizToggleLanguage: React.FC<QuizToggleLanguageProps> = ({
  swapLanguages,
  onToggleSwapLanguage,
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Switch
        id="swap-languages"
        checked={swapLanguages}
        onCheckedChange={onToggleSwapLanguage}
      />
      <Label htmlFor="swap-languages">Tukar Bahasa (Soal: B, Jawaban: A)</Label>
    </div>
  );
};

export default QuizToggleLanguage;