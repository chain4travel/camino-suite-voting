import { get } from '@/utils/http';

export const fetchProposalList = async (type: string, page = 0) =>
  get(`${type}/proposals.json`);
