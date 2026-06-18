import React, { useState, useMemo } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Input } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const VocabExcelTable = () => {
    const { vocabularySets } = useVocabularyStore();
    const [searchTerm, setSearchText] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentIndex] = useState(1);
    const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

    // Flatten all words for the "Excel" view
    const allWords = useMemo(() => {
        return vocabularySets.flatMap(set => 
            set.words.map(word => ({
                ...word,
                setName: set.name
            }))
        );
    }, [vocabularySets]);

    // Filtering logic
    const filteredData = useMemo(() => {
        return allWords.filter(item => 
            item.korean.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.indonesian.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.setName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allWords, searchTerm]);

    // Sorting logic
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // @ts-ignore
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                // @ts-ignore
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-4 bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">DATABASE KOSAKATA</h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Manajemen Data & Filter ala Excel</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input 
                            placeholder="Cari kata, arti, atau bab..." 
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(Number(val)); setCurrentIndex(1); }}>
                        <SelectTrigger className="w-[120px] rounded-xl font-bold">
                            <SelectValue placeholder="Baris" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 Baris</SelectItem>
                            <SelectItem value="100">100 Baris</SelectItem>
                            <SelectItem value="400">400 Baris</SelectItem>
                            <SelectItem value="500">500 Baris</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900">
                        <TableRow>
                            <TableHead className="w-[200px] font-black text-[10px] uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('korean')}>
                                <div className="flex items-center gap-2">KOREA <ArrowUpDown className="h-3 w-3" /></div>
                            </TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('indonesian')}>
                                <div className="flex items-center gap-2">ARTI INDONESIA <ArrowUpDown className="h-3 w-3" /></div>
                            </TableHead>
                            <TableHead className="w-[150px] font-black text-[10px] uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors" onClick={() => requestSort('setName')}>
                                <div className="flex items-center gap-2">SUMBER/BAB <ArrowUpDown className="h-3 w-3" /></div>
                            </TableHead>
                            <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-center">STATUS SRS</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item, idx) => (
                            <TableRow key={`${item.id}-${idx}`} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-b last:border-0">
                                <TableCell className="font-bold text-lg text-zinc-900 dark:text-zinc-100 py-4">{item.korean}</TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400 font-medium">{item.indonesian}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="rounded-lg font-bold text-[10px] bg-zinc-50 dark:bg-zinc-900">
                                        {item.setName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full mx-auto shadow-sm",
                                        item.srsLevel === 0 ? "bg-zinc-200" :
                                        item.srsLevel < 3 ? "bg-blue-400" :
                                        item.srsLevel < 6 ? "bg-amber-400" : "bg-emerald-500"
                                    )} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION NAV */}
            <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Menampilkan {paginatedData.length} dari {sortedData.length} kata
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        className="rounded-xl h-9 w-9 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                            let pageNum = currentPage;
                            if (currentPage > 3) pageNum = currentPage - 3 + i;
                            else pageNum = i + 1;
                            
                            if (pageNum > totalPages) return null;

                            return (
                                <Button 
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentIndex(pageNum)}
                                    className="h-9 w-9 rounded-xl font-bold text-xs"
                                >
                                    {pageNum}
                                </Button>
                            )
                        })}
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="rounded-xl h-9 w-9 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default VocabExcelTable;
