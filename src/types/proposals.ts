import { ReactElement } from 'react';

export enum ProposalTypes {
  BaseFee = 'Transaction Fees',
  General = 'General Proposal',
  NewMember = 'Admittance of new consortium members',
  ExcludeMember = 'Exlusion of consortium member',
  FeeDistribution = 'Transaction Fee Distribution',
  GrantProgram = 'TAKEOFF Camino Grant Program',
}
export type ProposalType = {
  id: number;
  name: string;
  abbr: string;
  icon?: ReactElement;
};
export type VotingOption = {
  option: number | string;
  value: number | boolean | string | number[];
  label?: string | string[];
};
export type Vote = {
  option: number;
  address?: string;
  votedDateTime?: number;
};
export interface VoteData extends Omit<Vote, 'votedDateTime'> {
  id: number;
  votedDateTime: string;
}
export type MultisigVote = {
  threshold: number;
  voted: { option: number; count: number };
};
export type Applicant = {
  name: string;
  email: string;
  pchainAddress: string;
  companyName: string;
  companyWebsite: string;
  companyIndustry: string;
  companyDescription: string;
  companyStage: string;
  milestones: string;
  numberOfFunds: number | string;
  useOfFunds: string;
  pitchDeck: string;
  additionalInfo?: string;
};
export type Proposal = {
  id: number | string;
  type: string;
  description: string;
  startDateTime: number;
  endDateTime: number;
  options: VotingOption[];
  result?: Vote[];
  voted?: Vote[];
  votes?: Vote[];
  status: string;
  forumLink?: string;
  target?: string | Applicant;
  multisig?: MultisigVote;
};
export type Group = {
  type: string;
  name: string;
  data: Proposal[];
  icon?: ReactElement;
};
export interface Percentage {
  percent: number | string;
}
export type Summary = {
  [key: string | number]: { count: number; percent: number | string };
};
export type Statistics = {
  totalVotes: number;
  summary: Summary;
  turnouts: Summary;
  eligibleVotes?: number;
};
export interface ProposalState {
  currentProposal: Proposal | null;
  setCurrentProposal: (proposal: Proposal) => void;
}
