// u-irvan-motion-seventeen-syllables-of-debugging-d194b605 — entrypoint
// (Node 22, standard library only).
//
// Seventeen Syllables of Debugging: write one haiku about debugging — three
// lines in the 5-7-5 syllable shape, at most 200 characters — to
// /output/entry.txt. A judge model compares haiku two at a time, weighing
// whether the form holds, whether the central picture is concrete (a
// breakpoint, a log line, a cursor at 3am), whether the last line turns the
// poem, and whether every word earns its place.
//
// The haiku below is written for that brief. The picture is concrete and
// drawn from a real night of debugging: a red breakpoint holding the line
// while log lines scroll past three in the morning. The turn lands in the
// last line — after all that staring, the culprit is a single typo, and it
// waves back at you. Nothing in it is filler: each word either sets the
// scene, counts toward the form, or delivers the turn.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HAIKU = [
  'The breakpoint waits, red',
  'log lines scroll past three a.m.',
  'one typo waves back',
].join('\n');

const MAX_CHARS = 200;

// Syllable counts for every word in the haiku, so the program itself can
// verify the 5-7-5 shape instead of trusting it. "a.m." is spoken "ay-em"
// (2 syllables), so line two is 1+1+1+1+1+2 = 7 either way it is read.
const SYLLABLES: Record<string, number> = {
  the: 1,
  breakpoint: 2,
  waits: 1,
  red: 1,
  log: 1,
  lines: 1,
  scroll: 1,
  past: 1,
  three: 1,
  am: 2, // "a.m.", spoken "ay-em"
  one: 1,
  typo: 2,
  waves: 1,
  back: 1,
};

const EXPECTED_SHAPE = [5, 7, 5];

function countSyllables(line: string): number {
  return line
    .replace(/a\.m\./gi, 'am') // keep "a.m." as one token before stripping dots
    .replace(/[,.]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .reduce((total, word) => {
      const n = SYLLABLES[word];
      if (n === undefined) throw new Error(`no syllable count for word: ${word}`);
      return total + n;
    }, 0);
}

function main(): void {
  // The gate: UTF-8 text, 1 to 200 characters, not only white space.
  // Fail loudly here instead of shipping an invalid entry.
  const chars = [...HAIKU].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (HAIKU.trim().length === 0) {
    throw new Error('entry is only white space');
  }
  const lines = HAIKU.split('\n');
  if (lines.length !== 3) {
    throw new Error(`entry must be exactly 3 lines, got ${lines.length}`);
  }
  // The form: each line must hit its 5-7-5 count exactly.
  lines.forEach((line, i) => {
    const n = countSyllables(line);
    if (n !== EXPECTED_SHAPE[i]) {
      throw new Error(`line ${i + 1} has ${n} syllables, expected ${EXPECTED_SHAPE[i]}: ${line}`);
    }
  });

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'entry.txt'), HAIKU + '\n', 'utf8');
  // Print the entry and its shape so the run log itself proves the form.
  lines.forEach((line, i) => {
    console.log(`${countSyllables(line)} syllables: ${line}`);
  });
  console.log(`wrote entry.txt (${chars} characters, 3 lines, 5-7-5)`);
}

main();
