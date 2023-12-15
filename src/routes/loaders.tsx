import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import {
  PersonAddAlt1Outlined,
  MoveUpOutlined,
  DatasetOutlined,
  IsoOutlined,
  HighlightOffOutlined,
  HelpCenterOutlined,
} from '@mui/icons-material';
import { ProposalTypes, ProposalType } from '@/types';

const iconSelector = (type: string) => {
  switch (type) {
    case ProposalTypes.NewMember:
      return <PersonAddAlt1Outlined />;
    case ProposalTypes.GrantProgram:
      return <MoveUpOutlined />;
    case ProposalTypes.FeeDistribution:
      return <DatasetOutlined />;
    case ProposalTypes.BaseFee:
      return <IsoOutlined />;
    case ProposalTypes.ExcludeMember:
      return <HighlightOffOutlined />;
    default:
      console.warn(`Unsupported voting type ${type}, use default icon`);
      return <HelpCenterOutlined />;
  }
};

export const votingTypeLoader = (queryClient: QueryClient) => async () => {
  // The following used when voting(proposal) types are fetching from backend API
  // const query = {
  //   queryKey: ['getVotingType'],
  //   queryFn: async () => fetchVotingTypes(),
  // };
  // // ⬇️ return data or fetch it
  // const result =
  //   queryClient.getQueryData(query.queryKey) ??
  //   (await queryClient.fetchQuery(query));

  const result = {
    data: Object.keys(ProposalTypes).map((key, idx) => ({
      id: idx,
      name: ProposalTypes[key],
      abbr: key,
      disabled: !['NewMember', 'ExcludeMember'].includes(key),
      restricted: !['NewMember'].includes(key),
      isAdminProposal: ['AdminNewMember', 'AdminExcludeMember'].includes(key),
      consortiumMemberOnly: ['ExcludeMember'].includes(key),
      caminoOnly: false, // ['BaseFee'].includes(key),
    })),
  };
  return {
    ...result,
    data: result?.data?.map((vtype: ProposalType) => ({
      ...vtype,
      icon: iconSelector(vtype.name),
    })),
  };
};
