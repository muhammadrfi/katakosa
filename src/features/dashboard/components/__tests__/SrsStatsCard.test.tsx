/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import SrsStatsCard from '../SrsStatsCard';
// Impor tipe 'Mock' langsung dari vitest
import { vi, type Mock } from 'vitest';

// Mock hook useVocabularyStore.
// Vitest akan mengganti implementasi asli dengan objek ini saat tes berjalan.
vi.mock('@/features/vocabulary/useVocabularyStore', () => ({
  useVocabularyStore: vi.fn(),
}));

// Mock komponen dari library Recharts untuk menyederhanakan tes dan menghindari
// error rendering dari library pihak ketiga.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, onClick, dataKey, data }) => (
    <div data-testid="pie" onClick={() => onClick(data[0])}>
      {children}
    </div>
  ),
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children, onClick, dataKey, data }) => (
    <div data-testid="bar" onClick={() => onClick(data[0])}>
      {children}
    </div>
  ),
  Tooltip: () => null,
  Legend: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
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
        word: 'test',
        translation: 'ujian',
        srsLevel: 1,
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
  },
];

// Kumpulan tes untuk komponen SrsStatsCard
describe('SrsStatsCard', () => {
  // Fungsi ini berjalan sebelum setiap tes ('it' block) di dalam 'describe' ini
  beforeEach(() => {
    // KITA PERBAIKI DI SINI
    // Kita melakukan 'type assertion' ganda.
    // 1. (useVocabularyStore as unknown): Memberitahu TypeScript untuk "melupakan" tipe asli dari hook Zustand.
    // 2. (... as Mock): Memberitahu TypeScript untuk mempercayai kita bahwa variabel ini sekarang bertipe Mock dari Vitest.
    // Ini diperlukan karena TypeScript tidak tahu bahwa vi.mock() telah mengganti hook asli di runtime.
    (useVocabularyStore as unknown as Mock).mockReturnValue({
      vocabularySets: mockVocabularySets,
      getFilteredWords: vi.fn().mockImplementation((words, filter) => {
        return words.filter(() => true);
      }),
    });
  });

  it('renders without crashing', () => {
    render(<SrsStatsCard />);
    expect(screen.getByText('Statistik Sistem Pengulangan Berjarak (SRS)')).toBeInTheDocument();
  });

  it('displays total vocabulary count', () => {
    render(<SrsStatsCard />);
    // Menggunakan regex untuk mencocokkan teks tanpa harus sama persis dengan angkanya.
    expect(screen.getByText(/Total Kosakata:/)).toBeInTheDocument();
  });

  it('opens dialog when pie chart section is clicked', () => {
    render(<SrsStatsCard />);
    // Mensimulasikan klik pada komponen Pie yang sudah kita mock
    fireEvent.click(screen.getByTestId('pie'));

    // Memastikan dialog muncul di dalam dokumen setelah diklik
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});