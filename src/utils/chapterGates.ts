import { CHAPTER_CONFIG } from '../data/riddles';

export const QUESTIONS_PER_CHAPTER = 20;
export const PASSING_PERCENTAGE = 0.95;
export const REQUIRED_CORRECT = Math.ceil(QUESTIONS_PER_CHAPTER * PASSING_PERCENTAGE); // 19 out of 20

export function getChapterStats(chapterNum: number, solvedIds: number[]) {
  const config = CHAPTER_CONFIG.find(c => c.chapter === chapterNum) || CHAPTER_CONFIG[0];
  const [start, end] = config.range;
  const solvedCount = solvedIds.filter(id => id >= start && id <= end).length;
  const percentage = Math.round((solvedCount / QUESTIONS_PER_CHAPTER) * 100);
  const isComplete = solvedCount >= REQUIRED_CORRECT;

  return {
    chapter: chapterNum,
    name: config.name,
    solvedCount,
    total: QUESTIONS_PER_CHAPTER,
    percentage,
    requiredToPass: REQUIRED_CORRECT,
    isComplete
  };
}

export function isChapterUnlocked(chapterNum: number, solvedIds: number[]) {
  if (chapterNum === 1) {
    return {
      unlocked: true,
      currentSolvedPrev: 0,
      neededToUnlock: 0,
      prevChapterName: '',
      message: 'Unlocked'
    };
  }

  const prevChapterNum = chapterNum - 1;
  const prevStats = getChapterStats(prevChapterNum, solvedIds);
  const unlocked = prevStats.solvedCount >= REQUIRED_CORRECT;
  const remaining = Math.max(0, REQUIRED_CORRECT - prevStats.solvedCount);

  return {
    unlocked,
    currentSolvedPrev: prevStats.solvedCount,
    neededToUnlock: REQUIRED_CORRECT,
    remainingToUnlock: remaining,
    prevChapterName: prevStats.name,
    message: unlocked 
      ? 'Unlocked' 
      : `Requires 95% (${REQUIRED_CORRECT}/${QUESTIONS_PER_CHAPTER}) in Chapter ${prevChapterNum}: ${prevStats.name}. Solve ${remaining} more to unlock!`
  };
}
