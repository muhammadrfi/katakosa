/// <reference types="vitest/globals" />
import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import SrsReviewHistoryCard from '../SrsReviewHistoryCard';
import { vi, type Mock } from 'vitest';

vi.mock('@/features/vocabulary/useVocabularyStore', () => ({
  useVocabularyStore: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <g />,
  Tooltip: () => null,
  Legend: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

const mockVocabularySets = [
  {
    id: '1',
    name: 'Test Set',
    createdAt: '2023-01-01',
    words: [
      {
        id: '1',
        bahasaA: 'test1',
        bahasaB: 'ujian1',
        interval: 1,
        repetition: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000,
        createdAt: '2023-01-01',
        history: [{ date: Date.now() - 86400000, status: 'remembered' as const }],
      },
      {
        id: '2',
        bahasaA: 'test2',
        bahasaB: 'ujian2',
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000,
        createdAt: '2023-01-01',
        history: [{ date: Date.now() - 172800000, status: 'forgotten' as const }],
      },
    ],
  },
];

describe('SrsReviewHistoryCard', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    (useVocabularyStore as unknown as Mock).mockReturnValue({
      vocabularySets: mockVocabularySets,
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
      root.render(<SrsReviewHistoryCard />);
    });
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(container.textContent).toContain('Riwayat Review SRS');
  });

  it('displays the chart title and description', () => {
    renderComponent();
    expect(container.textContent).toContain('Tren kata yang diingat dan terlupakan dari waktu ke waktu.');
  });

  it('renders the mocked chart component', () => {
    renderComponent();
    expect(container.querySelector('[data-testid="line-chart"]')).not.toBeNull();
  });
});
