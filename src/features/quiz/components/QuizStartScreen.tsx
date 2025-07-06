
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface QuizStartScreenProps {
  maxWordCount: number;
  onStart: (questionCount: number) => void;

}

const QuizStartScreen = ({ maxWordCount, onStart }: QuizStartScreenProps) => {
  const [questionCount, setQuestionCount] = useState(Math.min(maxWordCount, 20));

  const handleStart = () => {
    onStart(questionCount);
  };

  return (
    <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
      <Card>
        <CardHeader>
          <FileQuestion className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle>Tes Pilihan Ganda</CardTitle>
          <CardDescription>
            Uji pemahaman kosakatamu. Pilih berapa kata yang ingin diujikan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <div className="space-y-4 text-left px-4">
            <Label htmlFor="question-count" className="text-base flex justify-between">
              <span>Jumlah Pertanyaan</span>
              <span className="font-bold">{questionCount}</span>
            </Label>
            <Slider
              id="question-count"
              min={4}
              max={maxWordCount}
              step={1}
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
            />
          </div>

          <Button onClick={handleStart} size="lg">
            Mulai Tes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizStartScreen;
