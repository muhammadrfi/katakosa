// Types for Picture Vocabulary Quiz feature

export interface VocabImageItem {
  korean: string;
  indonesian: string;
  image: string;
  chapter: number;
}

export type PictureQuizMode = 'image-to-text' | 'text-to-image' | 'mixed';
export type PictureQuizQuestionType = 'image-to-text' | 'text-to-image';
export type PictureQuizLang = 'indonesian' | 'korean';

export interface PictureQuizQuestion {
  id: string;
  type: PictureQuizQuestionType;
  item: VocabImageItem; // the correct item
  correctAnswer: string; // for image-to-text: indonesian text; for text-to-image: image path
  questionDisplay: string; // what to show as the "question"
  options: PictureQuizOption[];
}

export interface PictureQuizOption {
  value: string;      // text or image path
  label: string;      // display label (for accessibility / text mode)
  isImage: boolean;   // whether this option renders as an image
}

export type PictureQuizStatus = 'idle' | 'active' | 'finished';
