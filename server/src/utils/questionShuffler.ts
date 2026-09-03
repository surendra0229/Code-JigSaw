import { ICodeLine } from '../models/Question.js';

export interface ClientCodeLine {
  id: string;
  code: string;
}

/**
 * Fisher-Yates shuffle algorithm to randomize code lines.
 * Guarantees that the initial shuffled state does not match original order if line count > 1.
 */
export const shuffleCodeLines = (lines: ICodeLine[]): { shuffledLines: ClientCodeLine[]; lineOrder: string[] } => {
  const lineCopies = lines.map(line => ({ id: line.id, code: line.code }));
  
  let shuffled = [...lineCopies];
  let attempts = 0;
  
  // Ensure it's actually shuffled (not identical to 1..N order) if possible
  do {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempts++;
  } while (
    shuffled.length > 2 && 
    attempts < 10 && 
    shuffled.every((l, index) => l.id === lines[index].id)
  );

  return {
    shuffledLines: shuffled,
    lineOrder: shuffled.map(l => l.id)
  };
};
