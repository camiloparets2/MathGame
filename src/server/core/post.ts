import { reddit } from '@devvit/web/server';
import { getDayIndex } from '../../shared/problems';

export const createPost = async () =>
  reddit.submitCustomPost({
    title: `Multiply — Daily Multiplication Challenge #${getDayIndex()} · Do You Deserve to Be a Senior Analyst?`,
  });