/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import SrsReviewHistoryCard from '../SrsReviewHistoryCard';
// --- PERBAIKAN 1: Impor tipe 'Mock' langsung dari vitest ---
import { vi, type Mock } from 'vitest';

// Mock hook useVocabularyStore
vi.mock('@/features/vocabulary/useVocabularyStore', () => ({
  useVocabularyStore: vi.fn(),
}));

// Mock komponen dari library Recharts yang mungkin digunakan.
// Ini mencegah error rendering dan mempercepat tes.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <g />,
  Tooltip: () => null,
  Legend: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

// Data dummy untuk digunakan dalam tes
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
    // --- PERBAIKAN 2: Gunakan type assertion ganda (as unknown as Mock) ---
    // Ini adalah cara yang benar untuk memberitahu TypeScript bahwa kita telah
    // mengganti hook asli dengan mock function pada saat runtime.
    (useVocabularyStore as unknown as Mock).mockReturnValue({
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

  it('renders the mocked chart component', () => {
    render(<SrsReviewHistoryCard />);
    // Memastikan bahwa komponen chart yang di-mock (LineChart) benar-benar ada di dalam dokumen.
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});