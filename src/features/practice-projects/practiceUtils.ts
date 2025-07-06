import { WordPair } from '../vocabulary/vocabulary.types';

export const getShuffledOptions = (allWords: WordPair[], correctAnswer: WordPair, count: number): WordPair[] => {
    const options = [correctAnswer];
    const distractors = allWords.filter(w => w.id !== correctAnswer.id);

    while (options.length < count && distractors.length > 0) {
        const randomIndex = Math.floor(Math.random() * distractors.length);
        options.push(distractors.splice(randomIndex, 1)[0]);
    }

    // Shuffle the final options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
};
