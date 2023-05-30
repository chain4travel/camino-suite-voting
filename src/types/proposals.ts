import { ReactElement } from 'react';

export type VotingType = {
  id: string;
  name: string;
  abbr?: string;
};
export type VotingOption = {
  option: number | string;
  value: number | boolean;
  label?: string;
};
export type Vote = {
  option: number;
};
export type Proposal = {
  id: number | string;
  type: string;
  description: string;
  startDateTime: number;
  endDateTime: number;
  options: VotingOption[];
  voted: Vote[];
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

export interface ProposalState {
  currentProposal: Proposal | null;
  setCurrentProposal: (proposal: Proposal) => void;
}
