import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import { submitScore, getLeaderboard, getWallOfShame, getPersonalBest, getTotalPlayers } from '../core/game';
import { getDayIndex } from '../../shared/problems';
import type {
  InitResponse,
  ScoreSubmitRequest,
  ScoreSubmitResponse,
  LeaderboardResponse,
  WallsResponse,
  Difficulty,
  DifficultyStats,
} from '../../shared/api';

export const api = new Hono();

api.get('/init', async (c) => {
  const postId   = context.postId  ?? 'unknown';
  const username = context.username ?? 'anon';
  const dayIndex = getDayIndex();
  const diffs: Difficulty[] = ['easy', 'medium', 'hard'];

  const allData = await Promise.all(
    diffs.flatMap(d => [
      getPersonalBest(postId, d, username),
      getLeaderboard(postId, d),
      getTotalPlayers(postId, d),
    ])
  );

  const build = (i: number): DifficultyStats => ({
    personalBest:  allData[i * 3 + 0] as number | null,
    leaderboard:   allData[i * 3 + 1] as any[],
    totalPlayers:  allData[i * 3 + 2] as number,
  });

  return c.json<InitResponse>({
    type: 'init',
    username,
    dayIndex,
    easy:   build(0),
    medium: build(1),
    hard:   build(2),
  }, 200);
});

api.post('/score', async (c) => {
  const postId   = context.postId  ?? 'unknown';
  const username = context.username ?? 'anon';
  const body     = await c.req.json<ScoreSubmitRequest>();

  const { rank, totalPlayers, isPersonalBest } = await submitScore(
    postId, username, body.difficulty, body.score, body.correct,
  );

  return c.json<ScoreSubmitResponse>({ type: 'score', rank, totalPlayers, isPersonalBest }, 200);
});

api.get('/leaderboard', async (c) => {
  const postId = context.postId ?? 'unknown';
  const diff   = (c.req.query('difficulty') ?? 'medium') as Difficulty;
  const [entries, totalPlayers] = await Promise.all([
    getLeaderboard(postId, diff),
    getTotalPlayers(postId, diff),
  ]);
  return c.json<LeaderboardResponse>({ type: 'leaderboard', entries, totalPlayers }, 200);
});

api.get('/walls', async (c) => {
  const postId = context.postId ?? 'unknown';
  const diff   = (c.req.query('difficulty') ?? 'medium') as Difficulty;
  const [fame, shame, totalPlayers] = await Promise.all([
    getLeaderboard(postId, diff),
    getWallOfShame(postId, diff),
    getTotalPlayers(postId, diff),
  ]);
  return c.json<WallsResponse>({ type: 'walls', fame, shame, totalPlayers }, 200);
});