import { ProposalType, ProposalTypes } from '@/types';
import { useIsFeatureEnabled } from '@/utils/featureFlags/featureFlagUtils';
import {
  DatasetOutlined,
  HelpCenterOutlined,
  HighlightOffOutlined,
  IsoOutlined,
  MoveUpOutlined,
  PersonAddAlt1Outlined,
} from '@mui/icons-material';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';

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

export const votingTypeLoader =
  (
    queryClient: QueryClient,
    isFeatureEnabled: (key: string) => Promise<boolean>
  ) =>
  async () => {
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
      data: await Promise.all(
        Object.keys(ProposalTypes).map(async (key, idx) => ({
          id: idx,
          name: ProposalTypes[key],
          abbr: key,
          disabled: !(await isFeatureEnabled(key)), // Pass caminoClient as an argument
          restricted: !['NewMember'].includes(key),
          isAdminProposal: ['AdminNewMember', 'AdminExcludeMember'].includes(
            key
          ),
          consortiumMemberOnly: ['ExcludeMember'].includes(key),
          caminoOnly: ['BaseFee'].includes(key),
        }))
      ),
    };
    return {
      ...result,
      data: result?.data?.map((vtype: ProposalType) => ({
        ...vtype,
        icon: iconSelector(vtype.name),
      })),
    };
  };
