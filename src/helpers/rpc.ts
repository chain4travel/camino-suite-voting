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
