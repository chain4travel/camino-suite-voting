import { get } from '@/utils/http';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  endTime: number;
  stakeLocked: boolean;
  verifiedLevel?: number;
}

export const fetchProposalList = async (type: string, page = 0) =>
  get(`${type}/proposals.json`);
