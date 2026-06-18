/// <reference types="vitest/globals" />
import { describe, it, expect } from 'vitest';
import { updateSrsProperties } from '../vocabularyActions';
import { WordPair } from '../vocabulary.types';

describe('vocabularyActions - updateSrsProperties (SM-2 Algorithm)', () => {
  const baseWord: WordPair = {
    id: 'test-word-1',
    bahasaA: 'apple',
    bahasaB: 'apel',
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    createdAt: new Date().toISOString(),
    history: [],
  };

  it('harus menginisialisasi repetisi pertama (repetition=0) dengan interval=1 jika kualitas >= 3', () => {
    const updatedWord = updateSrsProperties(baseWord, 4); // kualitas 4 (benar ragu-ragu)

    expect(updatedWord.repetition).toBe(1);
    expect(updatedWord.interval).toBe(1);
    expect(updatedWord.nextReviewDate).toBeGreaterThan(Date.now());
    expect(updatedWord.history?.length).toBe(1);
    expect(updatedWord.history?.[0].quality).toBe(4);
  });

  it('harus menetapkan interval=6 pada repetisi kedua (repetition=1) jika kualitas >= 3', () => {
    const wordRep1: WordPair = {
      ...baseWord,
      repetition: 1,
      interval: 1,
      easeFactor: 2.5,
    };

    const updatedWord = updateSrsProperties(wordRep1, 5); // kualitas 5 (benar sempurna)

    expect(updatedWord.repetition).toBe(2);
    expect(updatedWord.interval).toBe(6);
    expect(updatedWord.easeFactor).toBeGreaterThan(2.5); // kualitas 5 menaikkan EF
  });

  it('harus mengalikan interval dengan easeFactor pada repetisi ketiga dan seterusnya', () => {
    const wordRep2: WordPair = {
      ...baseWord,
      repetition: 2,
      interval: 6,
      easeFactor: 2.5,
    };

    const updatedWord = updateSrsProperties(wordRep2, 4); // kualitas 4

    // interval baru = Math.round(6 * 2.5) = 15
    expect(updatedWord.repetition).toBe(3);
    expect(updatedWord.interval).toBe(15);
  });

  it('harus mengatur ulang repetisi ke 0 dan interval ke 1 jika jawaban salah (kualitas < 3)', () => {
    const experiencedWord: WordPair = {
      ...baseWord,
      repetition: 5,
      interval: 30,
      easeFactor: 2.6,
    };

    const updatedWord = updateSrsProperties(experiencedWord, 1); // kualitas 1 (salah tetapi familiar)

    expect(updatedWord.repetition).toBe(0);
    expect(updatedWord.interval).toBe(1);
    expect(updatedWord.easeFactor).toBe(2.6); // ease factor tidak diubah saat salah
  });

  it('tidak boleh membiarkan easeFactor turun di bawah batas minimum 1.3', () => {
    const lowEfWord: WordPair = {
      ...baseWord,
      repetition: 3,
      interval: 6,
      easeFactor: 1.35,
    };

    // Memberikan nilai kualitas rendah (kualitas 3) berulang-ulang akan mengurangi easeFactor
    const updatedWord = updateSrsProperties(lowEfWord, 3);

    expect(updatedWord.easeFactor).toBe(1.3); // terpotong di batas minimum 1.3
  });
});
