import { get } from '@/helpers/http';

export const fetchActiveVotings = async (proposalType: number) =>
  get(`/proposals?proposalType=${proposalType}&proposalStatus=0`);

export const fetchCompletedVotes = async (proposalType: number) =>
  get(`/proposals?proposalType=${proposalType}&proposalStatus=3`);

export const fetchProposalDetail = async (id: string) =>
  get(`/proposals/${id}/votes`);
