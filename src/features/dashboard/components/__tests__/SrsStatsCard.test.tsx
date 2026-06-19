/// <reference types="vitest/globals" />
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import SrsStatsCard from '../SrsStatsCard';
import { vi, type Mock } from 'vitest';

vi.mock('@/features/vocabulary/useVocabularyStore', () => ({
  useVocabularyStore: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, onClick, data }: { children: React.ReactNode; onClick: (entry: { name: string }) => void; data: { name: string }[] }) => (
    <button type="button" data-testid="pie" onClick={() => onClick(data[0])}>
      {children}
    </button>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children, onClick, data }: { children: React.ReactNode; onClick: (entry: { name: string }) => void; data: { name: string }[] }) => (
    <button type="button" data-testid="bar" onClick={() => onClick(data[0])}>
      {children}
    </button>
  ),
  Tooltip: () => null,
  Legend: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
}));

const mockVocabularySets = [
  {
    id: '1',
    name: 'Test Set',
    createdAt: '2023-01-01',
    words: [
      {
        id: '1',
        bahasaA: 'test',
        bahasaB: 'ujian',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000,
        createdAt: '2023-01-01',
        history: [],
      },
    ],
  },
];

describe('SrsStatsCard', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    (useVocabularyStore as unknown as Mock).mockReturnValue({
      vocabularySets: mockVocabularySets,
      getFilteredWords: vi.fn().mockImplementation((words: typeof mockVocabularySets[number]['words']) => words),
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderComponent = () => {
    act(() => {
      root.render(<SrsStatsCard />);
    });
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(container.textContent).toContain('Statistik Sistem Pengulangan Berjarak (SRS)');
  });

  it('displays total vocabulary count', () => {
    renderComponent();
    expect(container.textContent).toContain('Total Kosakata');
  });

  it('shows filtered word list when pie chart section is clicked', () => {
    renderComponent();
    const pie = container.querySelector('[data-testid="pie"]');
    expect(pie).not.toBeNull();

    act(() => {
      pie?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Daftar Kata:');
  });
});
