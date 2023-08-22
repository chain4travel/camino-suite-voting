import { get } from '@/helpers/http';

export const fetchActiveVotings = async (proposalType: number) =>
  get(`/proposals?proposalType=${proposalType}&proposalStatus=0`);

export const fetchCompletedVotes = async (type: string) =>
  get(`completed_votes/${type.toLowerCase()}.json`);

export const fetchProposalDetail = async (type: string, id: string) =>
  get(`detail/${type.toLowerCase()}/${id}.json`);
