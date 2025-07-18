import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import { WordPair } from '@/features/vocabulary/vocabulary.types';


import FilteredWordList from '../../vocabulary/components/FilteredWordList';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Statistik Sistem Pengulangan Berjarak (SRS)</CardTitle>
                <CardDescription
                    className="cursor-pointer"
                    onClick={() => handleFilterClick('all', 'Semua Kata')}
                >
                    Visualisasi progres belajar kosakata Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm font-medium">Total Kosakata:</p>
                        <p className="text-2xl font-bold">{srsStats.total}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Kata Dikuasai:</p>
                        <p className="text-2xl font-bold text-green-600">{srsStats.mastered}</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            onClick={(entry) => handleFilterClick(nameToFilterType[entry.name], entry.name)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 20, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                            dataKey="value"
                            fill="#8884d8"
                            onClick={(entry) => handleFilterClick(nameToFilterType[entry.name], entry.name)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>

            {showFilteredList && (
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Daftar Kata: {initialFilter === 'all' ? 'Semua Kata' : nameToFilterType[initialFilter]}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Menampilkan kata-kata yang difilter berdasarkan kategori '{initialFilter}'.
                    </p>
                    <div>
                        <FilteredWordList allWords={allWords} initialFilterType={initialFilter} getFilteredWords={getFilteredWords} />
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SrsStatsCard;