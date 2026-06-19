import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { lookupWord } from "../utils";
import { cn } from "@/lib/utils";
import { grammars as rawGrammars } from "../grammar_data"; 


import { useVocabularyStore } from "../../vocabulary/useVocabularyStore";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const addWordToTryoutSet = (korean: string, indonesian: string) => {
  const store = useVocabularyStore.getState();
  let tryoutSet = store.vocabularySets.find(s => s.name === "Tryout EPS-TOPIK");
  if (!tryoutSet) {
    store.addVocabularySet("Tryout EPS-TOPIK", []);
    tryoutSet = useVocabularyStore.getState().vocabularySets.find(s => s.name === "Tryout EPS-TOPIK");
  }
  
  if (tryoutSet) {
    const wordExists = tryoutSet.words.some(w => w.bahasaA === korean);
    if (wordExists) {
      toast.info(`Kata "${korean}" sudah ada di set "Tryout EPS-TOPIK".`);
      return;
    }
    
    store.addWordToSet(tryoutSet.id, {
      bahasaA: korean,
      bahasaB: indonesian,
      repetition: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: null,
      createdAt: new Date().toISOString(),
      history: []
    });
    toast.success(`"${korean}" disimpan ke set "Tryout EPS-TOPIK".`);
  }
};

interface AnalyzedTextProps {
  text: string;
  dictionary: Record<string, string>;
  className?: string;
  enabled?: boolean;
}

const renderUnderlinedText = (txt: string) => {
  const parts = txt.split(/(<u>.*?<\/u>)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("<u>") && part.endsWith("</u>")) {
      const inner = part.substring(3, part.length - 4);
      return <u key={idx} className="underline decoration-2 decoration-zinc-950 dark:decoration-zinc-50 underline-offset-2">{inner}</u>;
    }
    return part;
  });
};

const AnalyzedText: React.FC<AnalyzedTextProps> = ({ text, dictionary, className, enabled = true }) => {
  if (!text) return null;
  if (!enabled) return <span className={className}>{renderUnderlinedText(text)}</span>;

  // Split text by <u> tags first
  const rawParts = text.split(/(<u>.*?<\/u>)/g);

  // Custom type for processed tokens
  interface RenderToken {
    text: string;
    isCompound: boolean;
    compoundTranslation?: string;
    compoundWord?: string;
    isSeparator: boolean;
    isUnderlined?: boolean;
  }
  
  const tokens: RenderToken[] = [];
  
  for (const rawPart of rawParts) {
    if (!rawPart) continue;
    
    const isUnderlined = rawPart.startsWith("<u>") && rawPart.endsWith("</u>");
    const cleanPart = isUnderlined 
      ? rawPart.substring(3, rawPart.length - 4) 
      : rawPart;
      
    // Now split cleanPart by separators
    const subParts = cleanPart.split(/(\s+|[.,!?()[\]"'/])/);
    
    for (let i = 0; i < subParts.length; i++) {
      const part = subParts[i];
      if (!part) continue;
      
      // Check if it's separator
      if (/^\s+$/.test(part) || /^[.,!?()[\]"'/]+$/.test(part)) {
        tokens.push({ text: part, isCompound: false, isSeparator: true, isUnderlined });
        continue;
      }
      
      // Look ahead for compound grammar patterns
      const nextSpace = subParts[i + 1];
      const nextWord = subParts[i + 2];
      
      if (nextSpace && /^\s+$/.test(nextSpace) && nextWord && !/^\s+$/.test(nextWord) && !/^[.,!?()[\]"'/]+$/.test(nextWord)) {
        const cleanNextWord = nextWord.replace(/[.,!?()[\]]/g, "").trim();
        
        // 1. 수 있다 / 수 없다
        if (part === "수" && (cleanNextWord.startsWith("있") || cleanNextWord.startsWith("없"))) {
          const isBisa = cleanNextWord.startsWith("있");
          tokens.push({
            text: `수 ${nextWord}`,
            isCompound: true,
            compoundWord: `수 ${cleanNextWord}`,
            compoundTranslation: isBisa 
              ? "bisa, dapat (TATA BAHASA)" 
              : "tidak bisa, tidak dapat (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2; // skip space and next word
          continue;
        }
        
        // 2. 지 않다 (negative)
        if (part === "지" && cleanNextWord.startsWith("않")) {
          tokens.push({
            text: `지 ${nextWord}`,
            isCompound: true,
            compoundWord: `지 ${cleanNextWord}`,
            compoundTranslation: "tidak, bukan (penyangkal) (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 3. 고 싶다 (want to)
        if (part === "고" && cleanNextWord.startsWith("싶")) {
          tokens.push({
            text: `고 ${nextWord}`,
            isCompound: true,
            compoundWord: `고 ${cleanNextWord}`,
            compoundTranslation: "ingin, mau (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 4. 기 전에 (before)
        if (part === "기" && cleanNextWord === "전에") {
          tokens.push({
            text: `기 전에`,
            isCompound: true,
            compoundWord: "기 전에",
            compoundTranslation: "sebelum (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 5. 기 때문에 (because)
        if (part === "기" && cleanNextWord === "때문에") {
          tokens.push({
            text: `기 때문에`,
            isCompound: true,
            compoundWord: "기 때문에",
            compoundTranslation: "karena, oleh karena (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 6. 것 같다 (seems like)
        if (part === "것" && cleanNextWord.startsWith("같")) {
          tokens.push({
            text: `것 ${nextWord}`,
            isCompound: true,
            compoundWord: `것 ${cleanNextWord}`,
            compoundTranslation: "sepertinya, mungkin (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 7. 편 이다 (cenderung)
        if (part === "편" && (cleanNextWord.startsWith("이") || cleanNextWord.startsWith("입") || cleanNextWord.startsWith("인"))) {
          tokens.push({
            text: `편 ${nextWord}`,
            isCompound: true,
            compoundWord: `편 ${cleanNextWord}`,
            compoundTranslation: "cenderung, termasuk kelompok (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
        
        // 8. 려고 하다 / 으려고 하다 (intend to)
        if ((part === "하려고" || part === "려고" || part === "으려고") && (cleanNextWord.startsWith("하") || cleanNextWord.startsWith("했") || cleanNextWord.startsWith("합"))) {
          tokens.push({
            text: `${part} ${nextWord}`,
            isCompound: true,
            compoundWord: `${part} ${cleanNextWord}`,
            compoundTranslation: "berniat untuk, berencana untuk (TATA BAHASA)",
            isSeparator: false,
            isUnderlined
          });
          i += 2;
          continue;
        }
      }
      
      // Default fallback
      tokens.push({ text: part, isCompound: false, isSeparator: false, isUnderlined });
    }
  }

  return (
    <span className={cn("inline-block", className)}>
      {tokens.map((t, i) => {
        if (t.isSeparator) {
          return (
            <span 
              key={i} 
              className={t.isUnderlined ? "underline decoration-2 decoration-zinc-950 dark:decoration-zinc-50 underline-offset-2" : ""}
            >
              {t.text}
            </span>
          );
        }

        let lookup: { 
          word: string; 
          translation: string; 
          particle?: string; 
          particleIndo?: string; 
          grammar?: string; 
          grammarIndo?: string;
          explanation?: string;
          chapter?: number;
          book?: number;
        } | null = null;

        if (t.isCompound && t.compoundWord && t.compoundTranslation) {
          let matchedGrammar = null;
          if (t.compoundWord.includes("수 있") || t.compoundWord.includes("수 없")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-(으)ㄹ 수 있다/없다");
          } else if (t.compoundWord.includes("지 않")) {
            matchedGrammar = {
              grammarName: "-지 않다",
              indo: "tidak / bukan (penyangkal)",
              explanation: "Ditempelkan pada stem kata kerja atau kata sifat untuk menyatakan bentuk penyangkalan atau negasi (artinya 'tidak...').",
              chapter: 7,
              book: 1
            };
          } else if (t.compoundWord.includes("고 싶")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-고 싶다");
          } else if (t.compoundWord.includes("기 전에")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-기 전에");
          } else if (t.compoundWord.includes("기 때문에")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-기 때문에");
          } else if (t.compoundWord.includes("것 같")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-는/(으)ㄴ 것 같다");
          } else if (t.compoundWord.includes("편 있") || t.compoundWord.includes("편 입") || t.compoundWord.includes("편 인") || t.compoundWord.includes("편 이")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-는 / -(으)ㄴ 편이다");
          } else if (t.compoundWord.includes("려고 하") || t.compoundWord.includes("으려고 하")) {
            matchedGrammar = rawGrammars.find(g => g.grammarName === "-(으)려고 하다");
          }

          if (matchedGrammar) {
            lookup = {
              word: t.compoundWord,
              translation: t.compoundTranslation,
              parts: [{ text: t.compoundWord, type: 'grammar', translation: t.compoundTranslation }],
              grammar: matchedGrammar.grammarName,
              grammarIndo: matchedGrammar.indo,
              explanation: matchedGrammar.explanation,
              chapter: matchedGrammar.chapter,
              book: matchedGrammar.book
            };
          } else {
            lookup = {
              word: t.compoundWord,
              translation: t.compoundTranslation,
              parts: [{ text: t.compoundWord, type: 'root', translation: t.compoundTranslation }]
            };
          }
        } else {
          lookup = lookupWord(t.text, dictionary);
        }

        if (!lookup || !lookup.translation) return <span key={i}>{t.text}</span>;

        const trans = lookup.translation.toUpperCase();
        let colorClass = "border-b-2 border-transparent";
        let category = "KOSAKATA UMUM";
        let colorHex = "bg-blue-500";

        const hasGrammar = lookup.parts.some(p => p.type === 'grammar');
        const hasParticle = lookup.parts.some(p => p.type === 'particle');
        const cleanTextWord = t.text.replace(/[.,!?()[\]"']/g, "").trim();
        const isNounFromVerb = cleanTextWord + "하다" === lookup.word || 
                              cleanTextWord + "(하다)" === lookup.word || 
                              cleanTextWord + "이다" === lookup.word || 
                              cleanTextWord + "(이다)" === lookup.word;

        const isVerbOrAdjective = !isNounFromVerb && (trans.includes("(KATA KERJA/SIFAT)") || lookup.word.endsWith("다"));
        const isConjugated = isVerbOrAdjective && (cleanTextWord !== lookup.word);

        // Classify color category
        // 1. TATA BAHASA (POLA BUKU / COMPOUND GRAMMAR) - MERAH
        if (t.isCompound || (hasGrammar && !isConjugated)) {
          colorClass = "border-b-2 border-red-500 hover:bg-red-500/10";
          category = "TATA BAHASA";
          colorHex = "bg-red-600";
        }
        // 2. KOSAKATA PERUBAHAN (KONJUGASI KATA KERJA/SIFAT) - ORANGE/AMBER
        else if (isConjugated) {
          colorClass = "border-b-2 border-amber-500 hover:bg-amber-500/10";
          category = "KOSAKATA PERUBAHAN";
          colorHex = "bg-amber-600";
        }
        // 3. PARTIKEL BUKU - HIJAU
        else if (hasParticle) {
          colorClass = "border-b-2 border-emerald-500 hover:bg-emerald-500/10";
          category = "PARTIKEL";
          colorHex = "bg-emerald-600";
        }
        // 4. KATA KERJA / SIFAT BASE - UNGU
        else if (isVerbOrAdjective) {
          colorClass = "border-b-2 border-purple-500 hover:bg-purple-500/10";
          category = "KATA KERJA / SIFAT";
          colorHex = "bg-purple-600";
        }
        // 5. KOSAKATA UMUM - BIRU
        else {
          colorClass = "border-b-2 border-blue-500 hover:bg-blue-500/10";
          category = "KOSAKATA UMUM";
          colorHex = "bg-blue-600";
        }

        return (
          <Popover key={i}>
            <PopoverTrigger asChild>
              <span 
                className={cn(
                  "cursor-pointer inline-block px-[1.5px] select-none active:scale-95 transition-all",
                  colorClass,
                  t.isUnderlined && "underline decoration-2 decoration-zinc-950 dark:decoration-zinc-50 underline-offset-2"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {t.text}
              </span>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="center" 
              className="p-4 w-[280px] md:w-[360px] shadow-2xl border-2 z-[110] bg-white dark:bg-zinc-950 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 flex flex-col gap-1">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none tracking-tight">
                        {t.text.replace(/[.,!?()[\]"']/g, "")}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rootPart = lookup?.parts.find(p => p.type === 'root') || lookup?.parts[0];
                        if (rootPart) {
                          addWordToTryoutSet(rootPart.text, rootPart.translation);
                        } else {
                          addWordToTryoutSet(lookup.word, lookup.translation);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 mt-1 self-start active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan ke Hafalan</span>
                    </button>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {lookup.parts.map((part, pIdx) => {
                            let partColor = "text-zinc-500 bg-zinc-100";
                            if (part.type === 'grammar') partColor = "text-red-700 bg-red-50";
                            if (part.type === 'particle') partColor = "text-emerald-700 bg-emerald-50";
                            if (part.type === 'compound' || part.type === 'root') partColor = "text-blue-700 bg-blue-50";
                            
                            return (
                                <div key={pIdx} className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1", partColor)}>
                                    {part.text}
                                    <span className="opacity-50 text-[8px] font-medium">({part.type.toUpperCase()})</span>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                  <span className={cn("text-[9px] uppercase tracking-tighter font-black px-2 py-0.5 rounded-full text-white shrink-0", colorHex)}>
                    {category}
                  </span>
                </div>
                
                <div className="h-[2px] bg-zinc-50 dark:bg-zinc-900 w-full" />
                
                <div className="space-y-2.5">
                    {lookup.parts.map((part, pIdx) => (
                        <div key={pIdx} className="flex gap-3 items-start">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full mt-2 shrink-0",
                                part.type === 'grammar' ? "bg-red-500" : 
                                part.type === 'particle' ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                            <div className="space-y-0.5">
                                <p className="text-[13px] font-black text-zinc-800 dark:text-zinc-100 leading-tight">
                                    {part.translation}
                                </p>
                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                                    {part.text} • {part.type === 'root' ? 'KATA DASAR' : part.type === 'compound' ? 'GABUNGAN' : part.type.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {lookup.explanation && (
                  <div className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 space-y-1">
                    <span className="font-extrabold text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Konteks: Bab {lookup.chapter} (Jilid {lookup.book})
                    </span>
                    <p className="font-medium italic">
                      {lookup.explanation}
                    </p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </span>
  );
};

export default AnalyzedText;
