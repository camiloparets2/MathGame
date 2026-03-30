import { redis } from '@devvit/web/server';
import type { LeaderboardEntry, Difficulty } from '../../shared/api';

// Keys — scoped by postId + difficulty so each leaderboard is independent
const keyLB = (postId: string, diff: string) => `math:${postId}:${diff}:lb`;
const keyPB = (postId: string, diff: string, user: string) => `math:${postId}:${diff}:pb:${user}`;

export async function submitScore(
  postId: string,
  username: string,
  difficulty: Difficulty,
  score: number,
  _correct: number,
): Promise<{ rank: number; totalPlayers: number; isPersonalBest: boolean }> {
  const lbKey = keyLB(postId, difficulty);
  const pbKey = keyPB(postId, difficulty, username);

  const existing = await redis.get(pbKey);
  const prevBest = existing ? parseInt(existing, 10) : -1;
  const isPersonalBest = score > prevBest;

  if (isPersonalBest) {
    await redis.set(pbKey, String(score));
    // Store negative score so zRange (ascending) returns highest scores first
    await redis.zAdd(lbKey, { score: -score, member: username });
  }

  const total = await redis.zCard(lbKey);
  try {
    const ascRank = await redis.zRank(lbKey, username);
    const rank = ascRank != null ? ascRank + 1 : total;
    return { rank, totalPlayers: total, isPersonalBest };
  } catch {
    return { rank: total, totalPlayers: total, isPersonalBest };
  }
}

export async function getLeaderboard(postId: string, difficulty: Difficulty): Promise<LeaderboardEntry[]> {
  const lbKey = keyLB(postId, difficulty);
  try {
    const results = await redis.zRange(lbKey, 0, 9, { by: 'rank' });
    return results.map((m, i) => {
      const rawScore = typeof m.score === 'number' ? -m.score : -parseInt(String(m.score ?? '0'), 10);
      return { username: m.member, score: rawScore, correct: 0, rank: i + 1 };
    });
  } catch {
    return [];
  }
}

export async function getWallOfShame(postId: string, difficulty: Difficulty): Promise<LeaderboardEntry[]> {
  const lbKey = keyLB(postId, difficulty);
  try {
    // Scores stored as negative, so the END of ascending order = lowest real scores
    const total = await redis.zCard(lbKey);
    if (total === 0) return [];
    const start = Math.max(0, total - 10);
    const results = await redis.zRange(lbKey, start, total - 1, { by: 'rank' });
    // Reverse so worst is first
    return results.reverse().map((m, i) => {
      const rawScore = typeof m.score === 'number' ? -m.score : -parseInt(String(m.score ?? '0'), 10);
      return { username: m.member, score: rawScore, correct: 0, rank: start + (results.length - i) };
    });
  } catch {
    return [];
  }
}

export async function getPersonalBest(postId: string, difficulty: Difficulty, username: string): Promise<number | null> {
  try {
    const val = await redis.get(keyPB(postId, difficulty, username));
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

export async function getTotalPlayers(postId: string, difficulty: Difficulty): Promise<number> {
  try { return await redis.zCard(keyLB(postId, difficulty)); }
  catch { return 0; }
}