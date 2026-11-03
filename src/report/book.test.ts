import { describe, expect, it } from 'vitest';
import { BOOK_MAX_WORDS, bookWords } from './book';

describe('her picture book', () => {
  it('puts the newest words she knows or says first, each once', () => {
    const known = new Map([
      ['animals/cat', 100],
      ['animals/dog', 300],
    ]);
    const says = { 'animals/cat': 400, 'food/apple': 200 };
    expect(bookWords(known, says, [])).toEqual(['animals/cat', 'animals/dog', 'food/apple']);
  });

  it('tops up a short book from the pack being played, without repeats', () => {
    const known = new Map([['animals/cat', 1]]);
    const fill = ['animals/cat', 'animals/cow', 'animals/dog', 'animals/duck', 'animals/hen', 'animals/sheep', 'animals/goat'];
    expect(bookWords(known, {}, fill)).toEqual(['animals/cat', 'animals/cow', 'animals/dog', 'animals/duck', 'animals/hen', 'animals/sheep']);
  });

  it('keeps a long book short enough for bedtime, and leaves out words it cannot show', () => {
    const known = new Map(Array.from({ length: 30 }, (_, i) => [`animals/a${i}`, i] as [string, number]));
    const book = bookWords(known, {}, [], (id) => id !== 'animals/a29');
    expect(book).toHaveLength(BOOK_MAX_WORDS);
    expect(book[0]).toBe('animals/a28');
  });
});
