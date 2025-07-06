/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import SrsReviewHistoryCard from '../SrsReviewHistoryCard';
import { vi } from 'vitest';

// Mock the useVocabularyStore hook
vi.mock('@/features/vocabulary/useVocabularyStore', () => ({
  useVocabularyStore: vi.fn(),
}));

const mockVocabularySets = [
  {
    id: '1',
    name: 'Test Set',
    createdAt: '2023-01-01',
    words: [
      {
        id: '1',
        word: 'test1',
        translation: 'ujian1',
        srsLevel: 1,
        interval: 1,
        repetition: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
        history: [{ date: new Date(Date.now() - 86400000).toISOString(), status: 'remembered' }],
      },
      {
        id: '2',
        word: 'test2',
        translation: 'ujian2',
        srsLevel: 1,
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
        history: [{ date: new Date(Date.now() - 172800000).toISOString(), status: 'forgotten' }],
      },
    ],
  },
];

describe('SrsReviewHistoryCard', () => {
  beforeEach(() => {
    (useVocabularyStore as vi.Mock).mockReturnValue({
      vocabularySets: mockVocabularySets,
    });
  });

  it('renders without crashing', () => {
    render(<SrsReviewHistoryCard />);
    expect(screen.getByText('Riwayat Review SRS')).toBeInTheDocument();
  });

  it('displays the chart title and description', () => {
    render(<SrsReviewHistoryCard />);
    expect(screen.getByText('Tren kata yang diingat dan terlupakan dari waktu ke waktu.')).toBeInTheDocument();
  });

  // You might need to mock Recharts components for more detailed testing
  // For simplicity, we're just checking if the component renders its basic structure
});