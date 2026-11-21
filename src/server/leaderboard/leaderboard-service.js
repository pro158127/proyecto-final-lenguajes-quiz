import { getTopResults } from '../repositories/game-repository.js';
import { DomainError } from '../../domain/errors.js';

export async function getLeaderboard(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 5) {
    throw new DomainError('INVALID_LIMIT', 'El límite debe estar entre 1 y 5.', 400);
  }
  return { items: await getTopResults(limit) };
}
