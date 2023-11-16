import { get } from '@/helpers/http';

export const fetchActiveVotings = async (page: number) =>
  get(`/proposals?proposalStatus=0`);

export const fetchCompletedVotes = async (
  proposalType: number,
  startTime?: string,
  endTime?: string
) =>
  get(
    `/proposals?proposalType=${proposalType}&proposalStatus=3${
      startTime ? `&startTime=${startTime}` : ''
    }${endTime ? `&endTime=${endTime}` : ''}`
  );

export const fetchProposalDetail = async (id: string) =>
  get(`/proposals/${id}`);
