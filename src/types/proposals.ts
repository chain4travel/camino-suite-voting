export type Option = {
  option: number;
  value: number | boolean;
  label?: string;
};
export type Vote = {
  option: number;
};
export type Proposal = {
  id: number;
  type: string;
  description: string;
  startDateTime: number;
  endDateTime: number;
  options: Option[];
  voted: Vote[];
  status: string;
  forumLink?: string;
  target?: string;
};
export type Group = {
  type: string;
  name: string;
  data: Proposal[];
};

export interface ProposalState {
  currentProposal: Proposal | null;
  setCurrentProposal: (proposal: Proposal) => void;
}
