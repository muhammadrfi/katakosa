
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';

interface ListeningStartScreenProps {
    totalWords: number;
    onStart: () => void;
}

const ListeningStartScreen = ({ totalWords, onStart }: ListeningStartScreenProps) => {
    return (
        <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
            <Card>
                <CardHeader>
                    <Volume2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <CardTitle>Latihan Mendengar</CardTitle>
                    <CardDescription>
                        Dengarkan kata dan pilih terjemahan yang benar. {totalWords} kata telah disiapkan untuk latihan ini.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={onStart} size="lg">
                        Mulai Latihan
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ListeningStartScreen;
