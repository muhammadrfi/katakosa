import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilteredWordList from '../../vocabulary/components/FilteredWordList';

// Consistent high-contrast modern palette matching theme accents
const COLORS = [
  '#64748b', // Baru: Slate (Muted Neutral)
  '#6366f1', // Belajar: Indigo (Process/Active)
  '#f59e0b', // Jatuh Tempo: Amber (Review needed)
  '#10b981', // Dikuasai: Emerald (Success)
  '#ef4444'  // Terlupakan: Red (Needs recall)
];

const nameToFilterType: { [key: string]: 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' } = {
    'Baru': 'new',
    'Belajar': 'learning',
    'Jatuh Tempo': 'due',
    'Dikuasai': 'mastered',
    'Terlupakan': 'forgotten',
};

const SrsStatsCard: React.FC = () => {
    const { vocabularySets, getFilteredWords } = useVocabularyStore();
    const [showFilteredList, setShowFilteredList] = useState(false);
    const [initialFilter, setInitialFilter] = useState<'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten'>('all');

    const allWords = useMemo(() => vocabularySets.flatMap(set => set.words), [vocabularySets]);

    const srsStats = useMemo(() => {
        return {
            new: getFilteredWords(allWords, 'new').length,
            learning: getFilteredWords(allWords, 'learning').length,
            due: getFilteredWords(allWords, 'due').length,
            mastered: getFilteredWords(allWords, 'mastered').length,
            forgotten: getFilteredWords(allWords, 'forgotten').length,
            total: allWords.length,
        };
    }, [allWords, getFilteredWords]);

    const handleFilterClick = (type: 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten', name: string) => {
        setInitialFilter(type);
        setShowFilteredList(true);
    };

    const data = [
        { name: 'Baru', value: srsStats.new },
        { name: 'Belajar', value: srsStats.learning },
        { name: 'Jatuh Tempo', value: srsStats.due },
        { name: 'Dikuasai', value: srsStats.mastered },
        { name: 'Terlupakan', value: srsStats.forgotten },
    ];

    // Chart styling helpers for dark/light themes
    const chartTooltipStyle = {
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        borderRadius: '0.75rem',
        color: 'hsl(var(--foreground))',
        fontSize: '12px'
    };

    return (
        <Card className="w-full bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground">
                    Statistik Sistem Pengulangan Berjarak (SRS)
                </CardTitle>
                <CardDescription
                    className="cursor-pointer hover:underline text-muted-foreground"
                    onClick={() => handleFilterClick('all', 'Semua Kata')}
                >
                    Visualisasi progres belajar kosakata Anda. Klik bagian grafik untuk melihat daftar kata.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-900/30 border border-border p-4 rounded-xl">
                    <div className="text-center sm:text-left">
                        <span className="text-xs text-muted-foreground block mb-1">Total Kosakata</span>
                        <span className="text-2xl font-black text-foreground">{srsStats.total}</span>
                    </div>
                    <div className="text-center sm:text-left border-l border-border pl-4">
                        <span className="text-xs text-muted-foreground block mb-1">Kata Dikuasai</span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{srsStats.mastered}</span>
                    </div>
                </div>

                {/* Tabs for charts switching */}
                <Tabs defaultValue="pie" className="w-full">
                    <div className="flex justify-end mb-4">
                        <TabsList className="bg-muted rounded-xl p-1 h-9">
                            <TabsTrigger value="pie" className="rounded-lg text-xs font-semibold">Diagram Lingkaran</TabsTrigger>
                            <TabsTrigger value="bar" className="rounded-lg text-xs font-semibold">Diagram Batang</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="pie" className="focus-visible:outline-none">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={90}
                                        fill="#8884d8"
                                        dataKey="value"
                                        onClick={(entry) => handleFilterClick(nameToFilterType[entry.name], entry.name)}
                                        className="cursor-pointer"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={chartTooltipStyle} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="bar" className="focus-visible:outline-none">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                    <Bar
                                        dataKey="value"
                                        fill="#8884d8"
                                        onClick={(entry) => handleFilterClick(nameToFilterType[entry.name], entry.name)}
                                        className="cursor-pointer"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>

                {showFilteredList && (
                    <div className="mt-6 border-t border-border pt-6">
                        <FilteredWordList allWords={allWords} initialFilterType={initialFilter} getFilteredWords={getFilteredWords} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SrsStatsCard;