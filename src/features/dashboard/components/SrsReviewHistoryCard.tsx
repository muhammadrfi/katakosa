import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SrsReviewHistoryCard: React.FC = () => {
    const { vocabularySets } = useVocabularyStore();

    const reviewHistoryData = useMemo(() => {
        const allWords = vocabularySets.flatMap(set => set.words);
        const dailyStats: { [key: string]: { remembered: number; forgotten: number } } = {};

        allWords.forEach(word => {
            word.history?.forEach(entry => {
                const date = new Date(entry.date).toLocaleDateString('en-CA'); // Format YYYY-MM-DD
                if (!dailyStats[date]) {
                    dailyStats[date] = { remembered: 0, forgotten: 0 };
                }
                if (entry.status === 'remembered') {
                    dailyStats[date].remembered++;
                } else {
                    dailyStats[date].forgotten++;
                }
            });
        });

        // Urutkan data berdasarkan tanggal
        const sortedDates = Object.keys(dailyStats).sort();
        return sortedDates.map(date => ({
            date,
            Diingat: dailyStats[date].remembered,
            Terlupakan: dailyStats[date].forgotten,
        }));
    }, [vocabularySets]);

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
                <CardTitle className="text-xl font-bold text-foreground">Riwayat Review SRS</CardTitle>
                <CardDescription className="text-muted-foreground">Tren kata yang diingat dan terlupakan dari waktu ke waktu.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={reviewHistoryData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip contentStyle={chartTooltipStyle} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                            <Line 
                                type="monotone" 
                                dataKey="Diingat" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                activeDot={{ r: 6 }} 
                                name="Diingat (Sukses)"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="Terlupakan" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                                name="Terlupakan (Gagal)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default SrsReviewHistoryCard;