import { get } from '@/helpers/http';

export const fetchActiveVotings = async (page = 0) =>
  get('active_votings.json');

export const fetchCompletedVotes = async (type: string, page = 0) =>
  get(`completed_votes/${type.toLowerCase()}.json`);
