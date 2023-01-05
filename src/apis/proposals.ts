import { get } from '@/utils/http';

export const fetchProposalList = async (type: string, page = 0) =>
  get(`${type}/proposals.json`);

export const fetchProposalHistory = async (type: string, page = 0) =>
  get(`${type}/proposalHistory.json`);
