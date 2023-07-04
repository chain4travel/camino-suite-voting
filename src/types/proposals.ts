import { ReactElement } from 'react';

export type VotingType = {
  id: string;
  name: string;
  abbr?: string;
  icon?: ReactElement;
};
export type VotingOption = {
  option: number | string;
  value: number | boolean | number[];
  label?: string | string[];
};
export type Vote = {
  option: number;
  address?: string;
  votedDateTime?: number;
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
  status: string;
  forumLink?: string;
  target?: string;
};
export type Group = {
  type: string;
  name: string;
  data: Proposal[];
  icon?: ReactElement;
};
export interface Percentage {
  percent: number;
}

export interface ProposalState {
  currentProposal: Proposal | null;
  setCurrentProposal: (proposal: Proposal) => void;
}
