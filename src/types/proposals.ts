import { ReactElement } from 'react';
import { PendingMultisigTx } from './wallet';

export enum ProposalTypes {
  BaseFee = 'Base Fee',
  NewMember = 'Admittance of new consortium members',
  ExcludeMember = 'Exclusion of consortium member',
  AdminNewMember = 'Admin Proposal for Admittance of new consortium members',
  AdminExcludeMember = 'Admin Proposal for Exclusion of consortium member',
  General = 'General Proposal',
  FeeDistribution = 'Transaction Fee Distribution',
  GrantProgram = 'TAKEOFF Camino Grant Program',
}
export enum ProposalStatuses {
  InProgress = 'In Progress',
  Success = 'Success',
  Failed = 'Failed',
  Completed = 'Completed',
}
export type ProposalType = {
  id: number;
  name: string;
  abbr: string;
  icon?: ReactElement;
  disabled?: boolean;
  restricted?: boolean;
  isAdminProposal?: boolean;
  consortiumMemberOnly?: boolean;
  caminoOnly?: boolean;
};
export type VotingOption = {
  option: number | string;
  value: number | boolean | string | number[];
  label?: string | string[];
};
export type Vote = {
  votedOptions: number[];
  voterAddr?: string;
  votedDateTime?: number;
};
export type APIVote = {
  voteTxID: string;
  votedAt: string;
  votedOptions: string;
  voterAddr: string;
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
export type APIPRoposalWrapper = {
  dacProposal: APIProposal;
  dacVotes: APIVote[];
};
export type APIProposal = {
  id: string;
  proposerAddr: string;
  startTime: string;
  endTime: string;
  type: number;
  options: string;
  memo: string;
  status: number;
  blockHeight: number;
  outcome?: number;
  admin_proposal?: boolean;
};
export type Proposal = {
  id: string;
  type: string;
  typeId: number;
  startTime: string;
  endTime: string;
  startTimestamp: number;
  endTimestamp: number;
  options: VotingOption[];
  status: number;
  blockHeight: number;
  outcome?: number;
  voted?: VotingOption[]; // voted option for current connected wallet
  votes?: Vote[];
  canVote?: boolean; // flag for current connected wallet has running validator at time when this proposal created
  inactive?: boolean;
  isCompleted?: boolean;
  description?: string;
  forumLink?: string;
  target?: string | Applicant;
  pendingMultisigTx?: PendingMultisigTx;
  seq?: number;
  isAdminProposal?: boolean;
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
