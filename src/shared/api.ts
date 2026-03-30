export type Difficulty = 'easy' | 'medium' | 'hard';

export type LeaderboardEntry = {
  username: string;
  score: number;
  correct: number;
  rank: number;
};

export type DifficultyStats = {
  personalBest: number | null;
  leaderboard: LeaderboardEntry[];
  totalPlayers: number;
};

export type InitResponse = {
  type: 'init';
  username: string;
  dayIndex: number;
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
};

export type ScoreSubmitRequest = {
  difficulty: Difficulty;
  score: number;
  correct: number;
  dayIndex: number;
};

export type ScoreSubmitResponse = {
  type: 'score';
  rank: number;
  totalPlayers: number;
  isPersonalBest: boolean;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  entries: LeaderboardEntry[];
  totalPlayers: number;
};

export type WallEntry = {
  username: string;
  score: number;
  correct: number;
  rank: number;
};

export type WallsResponse = {
  type: 'walls';
  fame: WallEntry[];   // top 10 all-time highest scorers
  shame: WallEntry[];  // bottom 10 all-time lowest scorers
  totalPlayers: number;
};