// TODO: use caminojs to call RPC, sign and send tx

import { VotingOption } from '@/types';

export const getTxFee = async () => {
  return 80;
};

export const getFeeDistribution = async () => {
  return [
    { label: 'Validators', value: 30 },
    { label: 'Take-off Grant Program', value: 40 },
    { label: 'Burn', value: 30 },
  ];
};

export const vote = async (
  proposalId: string | number,
  votingType: string,
  votes: VotingOption[]
) => {
  // TODO: call RPC
  const promise = new Promise(resolve => setTimeout(() => resolve(true), 2000));
  return promise;
};
