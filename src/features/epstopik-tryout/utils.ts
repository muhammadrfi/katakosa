import { grammars as rawGrammars, particles as rawParticles } from './grammar_data'; 
import { Question } from './types';


const sortedGrammars = [...rawGrammars].sort((a, b) => b.suffix.length - a.suffix.length);
const sortedParticles = [...rawParticles].sort((a, b) => b.suffix.length - a.suffix.length);

const stripSsBatchim = (char: string): string => {
  if (!char || char.length === 0) return char;
  const code = char.charCodeAt(0) - 0xAC00;
  if (code >= 0 && code < 11172) {
    const final = code % 28;
    if (final === 20) { // ㅆ batchim
      return String.fromCharCode(char.charCodeAt(0) - 20);
    }
  }
  return char;
};

const stripBatchim = (char: string, batchimCode: number): string => {
  if (!char || char.length === 0) return char;
  const code = char.charCodeAt(0) - 0xAC00;
  if (code >= 0 && code < 11172) {
    const final = code % 28;
    if (final === batchimCode) {
      return String.fromCharCode(char.charCodeAt(0) - batchimCode);
    }
  }
  return char;
};

export const resolveInformalVerb = (word: string): string[] => {
  if (!word) return [];
  const stems: string[] = [word];

  const complexSuffixes = [
    '아놓다', '어놓다', '해놓다',
    '는편이다', '은편이다', 'ㄴ편이다',
    '기전에', '기때문에',
    '아야되다', '어야되다', '해야되다',
    'ㄹ게요', '을게요',
    '라고하다', '으라고하다',
    '자고하다',
    '는것같다', '은것같다', 'ㄴ것같다',
    '나봐요', '가봐요',
    '기로했어요',
  ];

  for (const suffix of complexSuffixes) {
    if (word.endsWith(suffix)) {
      stems.push(word.replace(suffix, ''));
    }
  }

  // Handle final consonant modifiers by checking Jongseong of the last character
  const lastChar = word.slice(-1);
  
  // 1. ㄹ modifier (future / goal modifier, e.g. 들어갈 -> 들어가, 할 -> 하, 갈 -> 가)
  const cleanL = stripBatchim(lastChar, 8); // 8 is ㄹ batchim
  if (cleanL !== lastChar) {
    stems.push(word.slice(0, -1) + cleanL);
  }

  // 2. ㄴ modifier (past / adjective modifier, e.g. 만든 -> 만두, 간 -> 가)
  const cleanN = stripBatchim(lastChar, 4); // 4 is ㄴ batchim
  if (cleanN !== lastChar) {
    const stemWithoutN = word.slice(0, -1) + cleanN;
    stems.push(stemWithoutN);
    // If it's a ㄹ-drop verb, e.g. 만든 -> 만들다, 산 -> 살다
    if (stemWithoutN.endsWith('드')) stems.push(stemWithoutN.slice(0, -1) + '들');
    if (stemWithoutN.endsWith('사')) stems.push(stemWithoutN + 'ㄹ');
    if (stemWithoutN.endsWith('아')) stems.push(stemWithoutN + 'ㄹ');
    if (stemWithoutN.endsWith('파')) stems.push(stemWithoutN + 'ㄹ');
  }

  // 3. ㅂ modifier (formal ending modifier, e.g. 포함합 -> 포함하)
  const cleanB = stripBatchim(lastChar, 17); // 17 is ㅂ batchim
  if (cleanB !== lastChar) {
    stems.push(word.slice(0, -1) + cleanB);
  }

  // Handle double consonant (past tense) first by decomposing the last character
  const cleanLastChar = stripSsBatchim(lastChar);
  if (cleanLastChar !== lastChar) {
    const cleanSs = word.slice(0, -1) + cleanLastChar;
    stems.push(cleanSs);
    if (cleanSs.endsWith('와')) stems.push(cleanSs.slice(0, -1) + '오');
    if (cleanSs.endsWith('춰')) stems.push(cleanSs.slice(0, -1) + '추');
    if (cleanSs.endsWith('쳐')) stems.push(cleanSs.slice(0, -1) + '치');
    if (cleanSs.endsWith('껴')) stems.push(cleanSs.slice(0, -1) + '끼');
    if (cleanSs.endsWith('해')) stems.push(cleanSs.slice(0, -1) + '하');
  }

  // Handle standard conjugations
  if (word.endsWith('했어요')) stems.push(word.slice(0, -3) + '하다');
  if (word.endsWith('해요')) stems.push(word.slice(0, -2) + '하다');
  if (word.endsWith('하세요')) stems.push(word.slice(0, -3) + '하다');
  if (word.endsWith('하네요')) stems.push(word.slice(0, -3) + '하다');
  if (word.endsWith('합니다')) stems.push(word.slice(0, -3) + '하다');
  if (word.endsWith('하십시오')) stems.push(word.slice(0, -4) + '하다');
  if (word.endsWith('합니까')) stems.push(word.slice(0, -3) + '하다');
  if (word.endsWith('하십니다')) stems.push(word.slice(0, -4) + '하다');
  if (word.endsWith('하십니까')) stems.push(word.slice(0, -4) + '하다');
  if (word.endsWith('하셨습니다')) stems.push(word.slice(0, -5) + '하다');
  if (word.endsWith('하셨어요')) stems.push(word.slice(0, -4) + '하다');
  
  if (word.endsWith('아요')) stems.push(word.slice(0, -2));
  if (word.endsWith('어서')) stems.push(word.slice(0, -2));
  if (word.endsWith('아서')) stems.push(word.slice(0, -2));
  if (word.endsWith('해서')) stems.push(word.slice(0, -2) + '하다');
  if (word.endsWith('해')) stems.push(word.slice(0, -1) + '하');
  if (word.endsWith('대해')) stems.push('대하다');
  if (word.endsWith('대해서')) stems.push('대하다');

  if (word.endsWith('어요')) stems.push(word.slice(0, -2));
  if (word.endsWith('였어요')) stems.push(word.slice(0, -3) + '이다');
  if (word.endsWith('입니다')) stems.push(word.slice(0, -3));
  if (word.endsWith('입니까')) stems.push(word.slice(0, -3));
  if (word.endsWith('습니다')) stems.push(word.slice(0, -3));
  if (word.endsWith('습니까')) stems.push(word.slice(0, -3));
  if (word.endsWith('니다')) stems.push(word.slice(0, -2));
  if (word.endsWith('니까')) stems.push(word.slice(0, -2));
  if (word.endsWith('가요')) stems.push(word.slice(0, -2) + '다');
  if (word.endsWith('봐요')) stems.push(word.slice(0, -2) + '보다');
  if (word.endsWith('와요')) stems.push(word.slice(0, -2) + '오다');
  if (word.endsWith('커요')) stems.push(word.slice(0, -2) + '크다');
  if (word.endsWith('써요')) stems.push(word.slice(0, -2) + '쓰다');
  if (word.endsWith('펴요')) stems.push(word.slice(0, -2) + '펴다');
  if (word.endsWith('쳐요')) stems.push(word.slice(0, -2) + '치다');
  if (word.endsWith('져요')) stems.push(word.slice(0, -2) + '지다');
  if (word.endsWith('돼요')) stems.push(word.slice(0, -2) + '되다');
  if (word.endsWith('줘요')) stems.push(word.slice(0, -2) + '주다');
  if (word.endsWith('마셔요')) stems.push(word.slice(0, -3) + '마시다');
  if (word.endsWith('만나요')) stems.push(word.slice(0, -3) + '만나다');
  if (word.endsWith('읽었어요')) stems.push(word.slice(0, -4) + '읽다');
  if (word.endsWith('읽어요')) stems.push(word.slice(0, -3) + '읽다');
  if (word.endsWith('이에요')) stems.push(word.slice(0, -3));
  if (word.endsWith('예요')) stems.push(word.slice(0, -2));
  if (word.endsWith('뿐만아니라')) stems.push(word.slice(0, -5));
  if (word.endsWith('뿐만')) stems.push(word.slice(0, -2));
  if (word.endsWith('든지')) stems.push(word.slice(0, -2));
  if (word.endsWith('거나')) stems.push(word.slice(0, -2));
  if (word.endsWith('이나')) stems.push(word.slice(0, -2));
  if (word.endsWith('나')) stems.push(word.slice(0, -1));
  if (word.endsWith('겁니다')) stems.push('것'); 
  if (word.endsWith('겁니까')) stems.push('것');
  if (word.endsWith('거예요')) stems.push('것');
  if (word.endsWith('건데요')) stems.push('것');
  if (word.endsWith('하십시오')) stems.push(word.slice(0, -4) + '하다');
  if (word.endsWith('하십시오')) stems.push(word.slice(0, -4));
  if (word.endsWith('십시오')) stems.push(word.slice(0, -3));
  if (word.endsWith('으십시오')) stems.push(word.slice(0, -4));
  
  if (word.endsWith('는데')) stems.push(word.slice(0, -2));
  if (word.endsWith('면서')) stems.push(word.slice(0, -2));
  if (word.endsWith('으면서')) stems.push(word.slice(0, -3));
  if (word.endsWith('으면')) stems.push(word.slice(0, -2));
  if (word.endsWith('면')) stems.push(word.slice(0, -1));
  if (word.endsWith('며')) stems.push(word.slice(0, -1));
  
  // Future/Goal connectives
  if (word.endsWith('려고')) stems.push(word.slice(0, -2));
  if (word.endsWith('으려고')) stems.push(word.slice(0, -3));
  if (word.endsWith('려면')) stems.push(word.slice(0, -2));
  if (word.endsWith('으려면')) stems.push(word.slice(0, -3));
  
  // Modifiers (ㄴ, 은, 는, ㄹ, 을, 던)
  if (word.endsWith('한')) stems.push(word.slice(0, -1) + '하다');
  if (word.endsWith('할')) stems.push(word.slice(0, -1) + '하다');
  if (word.endsWith('는')) stems.push(word.slice(0, -1));
  if (word.endsWith('은')) stems.push(word.slice(0, -1));
  if (word.endsWith('을')) stems.push(word.slice(0, -1));
  if (word.endsWith('ㄹ')) stems.push(word.slice(0, -1));
  if (word.endsWith('던')) stems.push(word.slice(0, -1));
  
  // Nominalizer
  if (word.endsWith('기')) stems.push(word.slice(0, -1));

  if (word.endsWith('었다')) stems.push(word.slice(0, -2));
  if (word.endsWith('았다')) stems.push(word.slice(0, -2));
  if (word.endsWith('했다')) stems.push(word.slice(0, -2) + '하다');
  if (word.endsWith('었습니다')) stems.push(word.slice(0, -4));
  if (word.endsWith('았습니다')) stems.push(word.slice(0, -4));
  if (word.endsWith('했습니다')) stems.push(word.slice(0, -4) + '하다');

  if (word.includes('지않')) stems.push(word.split('지않')[0]);
  if (word.includes('어지')) stems.push(word.split('어지')[0]);
  if (word.includes('아지')) stems.push(word.split('아지')[0]);

  // Clean stems and map common irregularities
  const processedStems = stems.flatMap(s => {
    const list = [s];
    
    // 르 irregular (e.g. 잘라 -> 자르다, 불러 -> 부르다)
    // If word ends with '라' or '러' and the previous char has 'ㄹ' batchim
    if (s.length >= 2) {
        const last = s.slice(-1);
        const prev = s.slice(-2, -1);
        const cleanPrev = stripBatchim(prev, 8);
        if (cleanPrev !== prev && (last === '라' || last === '러')) {
            list.push(cleanPrev + '르');
        }
        // Handle past tense: 잘랐 -> 자르
        if (last === '랐' || last === '렀') {
            list.push(cleanPrev + '르');
        }
    }

    if (s.endsWith('들')) {
      // ㄷ irregular (e.g. 들 -> 듣)
      list.push(s.slice(0, -1) + '듣');
    }
    if (s.endsWith('추우')) {
      // ㅂ irregular (e.g. 추우 -> 춥)
      list.push(s.slice(0, -2) + '춥');
    }
    if (s.endsWith('도우')) {
      list.push(s.slice(0, -2) + '돕');
    }
    if (s.endsWith('어려우')) {
      list.push(s.slice(0, -3) + '어렵');
    }
    if (s.endsWith('쉬우')) {
      list.push(s.slice(0, -2) + '쉽');
    }
    // Add 우 irregular: 치워 -> 치우다
    if (s.endsWith('워')) {
        list.push(s.slice(0, -1) + '우');
    }
    return list;
  });

  // VERY IMPORTANT: filter for stems length >= 1 to allow 가, 오, 보, 쓰, 크, 사, 주, 듣, 춥, 돕
  return Array.from(new Set(processedStems.filter(s => s.length >= 1)));
};

export interface WordPart {
  text: string;
  type: 'root' | 'particle' | 'grammar' | 'compound' | 'suffix';
  translation?: string;
  indo?: string;
  explanation?: string;
}

export interface LookupResult {
  word: string;
  translation: string;
  parts: WordPart[];
  particle?: string;
  particleIndo?: string;
  grammar?: string;
  grammarIndo?: string;
  explanation?: string;
  chapter?: number;
  book?: number;
}

/**
 * Advanced Korean Morphological Analyzer for EPS-TOPIK
 * Performs recursive suffix stripping and compound noun splitting
 */
export const lookupWord = (word: string, dictionary: Record<string, string>): LookupResult | null => {
  if (!dictionary) return null;
  
  const cleanWord = word.replace(/[.,!?()[\]"']/g, "").trim();
  if (!cleanWord) return null;

  // Handle digit prefixes (e.g. 30세, 5월, 10일)
  const digitMatch = cleanWord.match(/^(\d+)([가-힣]+)$/);
  if (digitMatch) {
      const num = digitMatch[1];
      const unit = digitMatch[2];
      if (dictionary[unit]) {
          return {
              word: num + unit,
              translation: `${num} ${dictionary[unit]}`,
              parts: [
                  { text: num, type: 'root', translation: num },
                  { text: unit, type: 'root', translation: dictionary[unit] }
              ]
          };
      }
  }

  // Helper to find a word in dictionary handling (하다), (이다) suffixes
  const findInDict = (w: string): { word: string; translation: string } | null => {
    if (!w) return null;
    if (dictionary[w]) return { word: w, translation: dictionary[w] };
    if (dictionary[w + '하다']) return { word: w + '하다', translation: dictionary[w + '하다'] };
    if (dictionary[w + '(하다)']) return { word: w + '(하다)', translation: dictionary[w + '(하다)'] };
    if (dictionary[w + '이다']) return { word: w + '이다', translation: dictionary[w + '이다'] };
    if (dictionary[w + '(이다)']) return { word: w + '(이다)', translation: dictionary[w + '(이다)'] };
    if (dictionary[w + '다']) return { word: w + '다', translation: dictionary[w + '다'] };
    
    const variations = resolveInformalVerb(w);
    for (const v of variations) {
        if (dictionary[v]) return { word: v, translation: dictionary[v] };
        if (dictionary[v + '하다']) return { word: v + '하다', translation: dictionary[v + '하다'] };
        if (dictionary[v + '(하다)']) return { word: v + '(하다)', translation: dictionary[v + '(하다)'] };
        if (dictionary[v + '다']) return { word: v + '다', translation: dictionary[v + '다'] };
    }

    // Aggressive: try removing '하' or '한' if it's a compound verb
    if (w.endsWith('하') || w.endsWith('한')) {
        const root = w.slice(0, -1);
        if (dictionary[root]) return { word: root, translation: dictionary[root] };
    }
    
    return null;
  };

  // 1. Recursive Analyzer Core
  const analyze = (currentWord: string, depth = 0): { parts: WordPart[]; chapter?: number; book?: number; explanation?: string } | null => {
    if (depth > 3) return null; // Avoid infinite loops or too complex structures

    // Try direct match first
    const direct = findInDict(currentWord);
    if (direct) {
      return { 
        parts: [{ text: direct.word, type: 'root', translation: direct.translation }]
      };
    }

    // Try stripping particles (Right to Left)
    for (const p of sortedParticles) {
      if (currentWord.endsWith(p.suffix) && currentWord.length > p.suffix.length) {
        const stem = currentWord.slice(0, -p.suffix.length);
        const subResult = analyze(stem, depth + 1);
        if (subResult) {
          return {
            parts: [
              ...subResult.parts,
              { text: p.suffix, type: 'particle', translation: p.indo, explanation: p.explanation }
            ],
            chapter: subResult.chapter || p.chapter,
            book: subResult.book || p.book,
            explanation: subResult.explanation || p.explanation
          };
        }
      }
    }

    // Try stripping grammars (Right to Left)
    for (const g of sortedGrammars) {
      if (currentWord.endsWith(g.suffix) && currentWord.length > g.suffix.length) {
        const stem = currentWord.slice(0, -g.suffix.length);
        const subResult = analyze(stem, depth + 1);
        if (subResult) {
          return {
            parts: [
              ...subResult.parts,
              { text: g.suffix, type: 'grammar', translation: g.indo, explanation: g.explanation }
            ],
            chapter: subResult.chapter || g.chapter,
            book: subResult.book || g.book,
            explanation: subResult.explanation || g.explanation
          };
        }
      }
    }

    // 2. Compound Noun Splitter (Sliding Window)
    // Only for words >= 4 chars (most compounds are 2+2 or 2+3)
    if (currentWord.length >= 4) {
        for (let i = 2; i <= currentWord.length - 2; i++) {
            const part1 = currentWord.slice(0, i);
            const part2 = currentWord.slice(i);
            
            const match1 = findInDict(part1);
            const match2 = findInDict(part2);
            
            if (match1 && match2) {
                return {
                    parts: [
                        { text: match1.word, type: 'compound', translation: match1.translation },
                        { text: match2.word, type: 'compound', translation: match2.translation }
                    ]
                };
            }
        }
    }

    return null;
  };

  const result = analyze(cleanWord);
  if (!result) return null;

  // Build the backward compatible LookupResult
  const rootPart = result.parts.find(p => p.type === 'root' || p.type === 'compound');
  const particlePart = result.parts.find(p => p.type === 'particle');
  const grammarPart = result.parts.find(p => p.type === 'grammar');

  // Construct main translation
  let mainTranslation = "";
  if (result.parts.length === 1) {
      mainTranslation = result.parts[0].translation || "";
  } else {
      mainTranslation = result.parts
        .map(p => p.translation)
        .filter(Boolean)
        .join(" + ");
  }

  return {
    word: rootPart ? rootPart.text : cleanWord,
    translation: mainTranslation,
    parts: result.parts,
    particle: particlePart?.text,
    particleIndo: particlePart?.translation,
    grammar: grammarPart?.text,
    grammarIndo: grammarPart?.translation,
    explanation: result.explanation,
    chapter: result.chapter,
    book: result.book
  };
};

export const parseQuestionContent = (q: Pick<Question, 'question_text' | 'group_instruction'> & { question_number?: number }) => {
  const text = (q.question_text || "").trim();
  const group = (q.group_instruction || "").trim();
  let instruction = "";
  let prompt = "";

  const splitTextByInstruction = (input: string) => {
    if (!input) return { inst: "", pr: "" };

    // 1. If it contains \n, split by the first \n
    if (input.includes("\n")) {
      const parts = input.split("\n");
      return { 
        inst: parts[0].trim(), 
        pr: parts.slice(1).join("\n").trim() 
      };
    }

    const endings = [
      '고르십시오.', '고르십시오',
      '하십시오.', '하십시오',
      '답하십시오.', '답하십시오',
      '입니까?', '입니까',
      '완성하십시오.', '완성하십시오',
      '쓰십시오.', '쓰십시오',
      '맞습니까?', '맞습니까',
      '인가요?', '인가요',
      '것은?', '것은'
    ];

    let splitStart = -1;
    let splitIndex = -1;
    for (const ending of endings) {
      const idx = input.indexOf(ending);
      if (idx !== -1 && idx < 120) {
        if (splitStart === -1 || idx < splitStart || (idx === splitStart && (idx + ending.length) > splitIndex)) {
          splitStart = idx;
          splitIndex = idx + ending.length;
        }
      }
    }

    if (splitIndex !== -1 && splitIndex < input.length) {
      return {
        inst: input.substring(0, splitIndex).trim(),
        pr: input.substring(splitIndex).trim()
      };
    }

    // Check if the whole text is just an instruction
    for (const ending of endings) {
      if (input.endsWith(ending)) {
        return { inst: input, pr: "" };
      }
    }

    return { inst: "", pr: input };
  };

  const parsed = splitTextByInstruction(text);

  if (group) {
    let rangeMatches = true;
    const rangeMatch = group.match(/\[(\d+)~(\d+)\]/);
    if (rangeMatch && q.question_number) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      const qNum = q.question_number;
      if (qNum < start || qNum > end) {
        rangeMatches = false;
      }
    }

    if (rangeMatches) {
      instruction = group;
      prompt = parsed.pr || parsed.inst;
      if (prompt === parsed.inst && !parsed.pr) {
        prompt = "";
      }
    } else {
      instruction = parsed.inst || group;
      prompt = parsed.pr;
    }
  } else {
    instruction = parsed.inst || "질문에 답하십시오.";
    prompt = parsed.pr;
  }

  if (!prompt && !instruction) {
    instruction = "질문에 답하십시오.";
    prompt = text;
  }

  return { instruction, prompt };
};
