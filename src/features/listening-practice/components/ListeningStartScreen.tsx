import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';

interface ListeningStartScreenProps {
    totalWords: number;
    onStart: () => void;
}

const ListeningStartScreen = ({ totalWords, onStart }: ListeningStartScreenProps) => {
    return (
        <div className="container mx-auto py-12 px-4 max-w-xl text-center">
            <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pt-8 pb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
                        <Volume2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">Latihan Mendengar</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        Dengarkan kata dalam bahasa asing dan pilih terjemahan yang benar. Kami telah menyiapkan {totalWords} kata untuk sesi latihan Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Button onClick={onStart} size="lg" className="rounded-xl w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5">
                        Mulai Latihan
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ListeningStartScreen;
