export const getRelevantContext = async (query: string, userContext: any = {}) => {
  const q = query.toLowerCase();
  
  try {
    // 1. Fetch data statis (tetap seperti sebelumnya)
    const [soalRes, dictRes, gramRes] = await Promise.all([
      fetch('/data/soal_epstopik.json'),
      fetch('/data/dictionary.json'),
      fetch('/data/textbook_grammar.json')
    ]);

    const staticContext = {
      soal: soalRes.ok ? await soalRes.json() : [],
      dictionary: dictRes.ok ? await dictRes.json() : {},
      grammar: gramRes.ok ? await gramRes.json() : []
    };

    const keywords = q.split(/\s+/).filter(k => k.length > 2);
    
    // 2. RETRIEVAL CERDAS (Menggabungkan statis + userContext)
    return {
      soal: staticContext.soal.filter((s: any) => keywords.some(k => s.question_text?.toLowerCase().includes(k))).slice(0, 2),
      dictionary: Object.entries(staticContext.dictionary).filter(([k]) => keywords.some(kw => k.includes(kw))).slice(0, 3),
      grammar: staticContext.grammar.filter((g: any) => 
        keywords.some(k => 
          g.grammar?.toLowerCase().includes(k) || 
          g.meaning?.toLowerCase().includes(k) ||
          g.explanation?.toLowerCase().includes(k)
        )
      ),
      // DATA USER (Diinjeksi di sini)
      userVocabs: userContext.vocabs?.slice(-20) || [], // Ambil 20 vocab terakhir user
      userSrs: userContext.srs || {} // Stats progres user
    };
  } catch (e) {
    console.error("Retrieval failed:", e);
    return { soal: [], dictionary: [], grammar: [], userVocabs: [], userSrs: {} };
  }
};
