import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface SrsReviewHistoryCardProps {
    // Properti tambahan jika diperlukan
}

const SrsReviewHistoryCard: React.FC<SrsReviewHistoryCardProps> = () => {
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

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Riwayat Review SRS</CardTitle>
                <CardDescription>Tren kata yang diingat dan terlupakan dari waktu ke waktu.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={reviewHistoryData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Diingat" stroke="#82ca9d" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Terlupakan" stroke="#ff7300" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default SrsReviewHistoryCard;