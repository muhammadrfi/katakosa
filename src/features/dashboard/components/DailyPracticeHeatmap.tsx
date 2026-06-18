import { useMemo } from 'react';
import { useGamificationStore } from '../useGamificationStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export default function DailyPracticeHeatmap() {
  const { historyLogs } = useGamificationStore();

  // Generate 365 days ending today
  const calendarGrid = useMemo(() => {
    const grid: { dateStr: string; date: Date; count: number }[][] = [];
    const today = new Date();
    
    // We want 53 weeks. Let's find the starting date: today minus 364 days.
    const startOffset = new Date(today);
    startOffset.setDate(today.getDate() - 364);

    // Align startOffset to the beginning of its week (Sunday = 0)
    const dayOfWeek = startOffset.getDay();
    const startDate = new Date(startOffset);
    startDate.setDate(startOffset.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);
    
    for (let week = 0; week < 53; week++) {
      const weekDays: { dateStr: string; date: Date; count: number }[] = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = historyLogs[dateStr] || 0;
        
        weekDays.push({
          dateStr,
          date: new Date(currentDate),
          count,
        });
        
        // Increment day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      grid.push(weekDays);
    }
    return grid;
  }, [historyLogs]);

  // Calculate total study days and total answers
  const stats = useMemo(() => {
    let totalCount = 0;
    let activeDays = 0;
    Object.values(historyLogs).forEach(c => {
      if (c > 0) {
        activeDays++;
        totalCount += c;
      }
    });
    return { totalCount, activeDays };
  }, [historyLogs]);

  // Minimalist Modern styling colors (solid flat, no glowing shadows or pulse animations)
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800/50';
    if (count <= 2) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30';
    if (count <= 5) return 'bg-emerald-350 bg-emerald-200 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50';
    if (count <= 9) return 'bg-emerald-400 text-white dark:bg-emerald-700 dark:text-emerald-100 border border-emerald-500 dark:border-emerald-600';
    return 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-900 border border-emerald-700 dark:border-emerald-400';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Riwayat Latihan Harian
          </h3>
          <p className="text-xs text-muted-foreground">
            Konsistensi belajar kosakata Anda dalam 365 hari terakhir
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-muted-foreground">
          <div className="flex flex-col bg-muted border border-border rounded-xl p-2.5 px-4">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider">Total Aksi Latihan</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.totalCount}</span>
          </div>
          <div className="flex flex-col bg-muted border border-border rounded-xl p-2.5 px-4">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider">Hari Aktif</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.activeDays} hari</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex select-none min-w-[640px] items-start gap-2">
          {/* Day Labels column */}
          <div className="grid grid-rows-7 gap-[3px] text-[10px] text-muted-foreground font-medium h-[112px] pt-[2px] pr-1">
            {dayLabels.map((label, i) => (
              <span key={label} className={cn("flex items-center", i % 2 === 0 ? "opacity-0" : "opacity-100")}>
                {label}
              </span>
            ))}
          </div>

          {/* Heatmap Grid */}
          <TooltipProvider>
            <div className="flex gap-[3px]">
              {calendarGrid.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-rows-7 gap-[3px]">
                  {week.map(({ dateStr, date, count }) => (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-[13px] h-[13px] rounded-[2px] transition-all duration-200 hover:scale-125 cursor-pointer",
                            getColorClass(count)
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white p-2 text-xs rounded-lg shadow-lg">
                        <span className="font-semibold text-emerald-400">{count} aksi belajar</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(date)}</span>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Grid Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4 text-[10px] text-muted-foreground">
        <span>Kurang</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800/50" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-200 dark:bg-emerald-900/40 border border-emerald-350" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400 dark:bg-emerald-750 border border-emerald-500" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
        <span>Lebih Banyak</span>
      </div>
    </div>
  );
}
