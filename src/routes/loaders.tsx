import React from 'react';
import { QueryClient } from 'react-query';
import {
  PersonAddAlt1Outlined,
  MoveUpOutlined,
  DatasetOutlined,
  IsoOutlined,
  HighlightOffOutlined,
  HelpCenterOutlined,
} from '@mui/icons-material';
import { fetchVotingTypes } from '@/apis';
import { VotingType } from '@/types';

const iconSelector = (type: string) => {
  switch (type) {
    case 'NEW_MEMBER':
      return <PersonAddAlt1Outlined />;
    case 'GRANT':
      return <MoveUpOutlined />;
    case 'FEE_DISTRIBUTION':
      return <DatasetOutlined />;
    case 'BASE_FEE':
      return <IsoOutlined />;
    case 'EXCLUDE_MEMBER':
      return <HighlightOffOutlined />;
    default:
      console.warn(`Unsupported voting type ${type}, use default icon`);
      return <HelpCenterOutlined />;
  }
};

export const votingTypeLoader = (queryClient: QueryClient) => async () => {
  const query = {
    queryKey: ['getVotingType'],
    queryFn: async () => fetchVotingTypes(),
  };
  // ⬇️ return data or fetch it
  const result =
    queryClient.getQueryData(query.queryKey) ??
    (await queryClient.fetchQuery(query));
  return {
    ...result,
    data: result?.data?.map((vtype: VotingType) => ({
      ...vtype,
      icon: iconSelector(vtype.id),
    })),
  };
};
