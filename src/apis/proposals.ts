import { get } from '@/helpers/http';

export const fetchActiveVotings = async (page = 0) =>
  get('active_votings.json');

export const fetchProposalHistory = async (type: string, page = 0) =>
  get(`${type}/proposalHistory.json`);
