import { useState, useEffect } from 'react';
import { VocabImageItem } from './types';

interface UseTextbookVisualDataReturn {
  items: VocabImageItem[];
  loading: boolean;
  error: string | null;
  totalChapters: number;
}

const useTextbookVisualData = (chapterFilter?: number[]): UseTextbookVisualDataReturn => {
  const [items, setItems] = useState<VocabImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const chapterNums = Array.from({ length: 60 }, (_, i) => i + 1);

    Promise.allSettled(
      chapterNums.map(ch =>
        fetch(`/data/textbook_visual_ch${ch}.json?v=6.3`)
          .then(r => (r.ok ? r.json() : null))
          .then(data => ({ ch, data }))
      )
    ).then(results => {
      if (cancelled) return;
      const allItems: VocabImageItem[] = [];

      results.forEach(res => {
        if (res.status !== 'fulfilled' || !res.value?.data) return;
        const { ch, data } = res.value;

        // Apply chapter filter if provided
        if (chapterFilter && chapterFilter.length > 0 && !chapterFilter.includes(ch)) return;

        for (const sec of data.sections || []) {
          if (sec.type !== 'vocab') continue;
          for (const item of sec.items || []) {
            if (item.image && item.image.length > 0) {
              allItems.push({
                korean: item.korean || '',
                indonesian: item.indonesian || '',
                image: item.image,
                chapter: ch,
              });
            }
          }
        }
      });

      setItems(allItems);
      setLoading(false);
    }).catch(err => {
      if (!cancelled) {
        setError('Gagal memuat data kosakata gambar.');
        setLoading(false);
        console.error(err);
      }
    });

    return () => { cancelled = true; };
  }, [JSON.stringify(chapterFilter)]);

  const totalChapters = [...new Set(items.map(i => i.chapter))].length;

  return { items, loading, error, totalChapters };
};

export default useTextbookVisualData;
