import { useGamificationStore, AVAILABLE_BADGES } from '../useGamificationStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Zap, Flame, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function GamificationCard() {
  const { xp, level, badges, streak, resetGamification } = useGamificationStore();
  const xpNeeded = level * 100;
  const progressPercent = Math.min((xp / xpNeeded) * 100, 100);

  return (
    <Card className="w-full bg-card border border-border shadow-sm rounded-2xl relative overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500" />
            Pusat Pencapaian
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Kumpulkan XP, naikkan level, dan dapatkan lencana eksklusif
          </CardDescription>
        </div>
        
        {/* Streak Badge */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-full px-3 py-1 text-xs text-orange-700 dark:text-orange-400 font-bold">
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500" />
            {streak} Hari Streak!
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Level and XP Progress */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-muted-foreground">Level</span>
              <span className="text-3xl font-extrabold text-foreground">{level}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">XP Sesi: </span>
              <span className="text-sm font-bold text-foreground">{xp} / {xpNeeded} XP</span>
            </div>
          </div>
          
          <div className="relative">
            <Progress value={progressPercent} className="h-3 bg-muted" />
          </div>
          
          <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            Butuh {xpNeeded - xp} XP lagi untuk naik ke Level {level + 1}
          </p>
        </div>

        {/* Badges Section */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lencana Anda ({badges.length}/{AVAILABLE_BADGES.length})</h4>
          
          <TooltipProvider>
            <div className="grid grid-cols-5 gap-3">
              {AVAILABLE_BADGES.map((badge) => {
                const isUnlocked = badges.includes(badge.id);
                return (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 relative cursor-help ${
                          isUnlocked
                            ? `bg-gradient-to-b ${badge.color} border-white/10 text-white scale-100 hover:scale-105 shadow-sm`
                            : 'bg-muted border-border opacity-45 grayscale hover:opacity-60 text-muted-foreground'
                        }`}
                      >
                        <span className="text-2xl mb-1">{badge.icon}</span>
                        <span className="text-[9px] font-bold text-center line-clamp-1 w-full">{badge.name}</span>
                        
                        {isUnlocked && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 border border-white text-[8px] font-bold text-white shadow-sm">
                            ✓
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-slate-900 border border-slate-800 text-white p-3 max-w-[200px] rounded-lg shadow-lg">
                      <div className="font-bold text-purple-300 mb-0.5">{badge.name}</div>
                      <div className="text-[10px] text-slate-300">{badge.description}</div>
                      <div className={`text-[9px] mt-1.5 font-semibold ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isUnlocked ? '✓ Sudah Terbuka' : '🔒 Belum Terbuka'}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>

        {/* Reset Gamification statistics */}
        <div className="flex justify-end pt-1">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground hover:text-red-400 h-7 px-2">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Gamifikasi
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Data Gamifikasi?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan mengembalikan level Anda ke 1, XP ke 0, menghapus semua lencana yang diperoleh, dan mengosongkan riwayat heatmap aktivitas Anda. Progres kosakata tidak akan berubah.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={resetGamification} className="bg-red-600 hover:bg-red-700">Ya, Reset Gamifikasi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
