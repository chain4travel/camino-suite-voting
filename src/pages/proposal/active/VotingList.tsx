import React from 'react';
import { List, ListItemButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProposalTypes, type Applicant, type Proposal } from '@/types';
import NewMemberVoting from './NewMemberVoting';
import BaseFeeVoting from './BaseFeeVoting';
import ListItemStatus from '@/components/ListItemStatus';
import ExcludeMemberVoting from './ExcludeMemberVoting';
import FeeDistributionVoting from './FeeDistributionVoting';
import GrantProgramVoting from './GrantProgram';

interface VotingListProps {
  data: { type: string; typeId: number; name: string; data: Proposal[] };
  isConsortiumMember?: boolean;
  refresh?: () => void;
}
const VotingList = ({ data, isConsortiumMember, refresh }: VotingListProps) => {
  const navigate = useNavigate();
  return (
    <List disablePadding>
      {data.data.map((proposal: Proposal, index: number) => {
        let Vote: JSX.Element | null = null;
        switch (data.type) {
          case ProposalTypes.BaseFee:
            Vote = (
              <BaseFeeVoting
                data={proposal}
                isConsortiumMember={isConsortiumMember}
                refresh={refresh}
              />
            );
            break;
          case ProposalTypes.NewMember:
            Vote = (
              <Stack width="100%">
                <NewMemberVoting
                  data={proposal}
                  isConsortiumMember={isConsortiumMember}
                />
                <ListItemStatus
                  startTimestamp={proposal.startTimestamp}
                  endTimestamp={proposal.endTimestamp}
                  multisig={proposal.multisig}
                />
              </Stack>
            );
            break;
          case ProposalTypes.ExcludeMember:
            Vote = (
              <Stack width="100%">
                <ExcludeMemberVoting
                  data={proposal}
                  isConsortiumMember={isConsortiumMember}
                />
                <ListItemStatus
                  startTimestamp={proposal.startTimestamp}
                  endTimestamp={proposal.endTimestamp}
                  multisig={proposal.multisig}
                />
              </Stack>
            );
            break;
          case ProposalTypes.FeeDistribution:
            Vote = (
              <FeeDistributionVoting
                data={proposal}
                isConsortiumMember={isConsortiumMember}
              />
            );
            break;
          case ProposalTypes.GrantProgram:
            {
              const applicant = proposal.target! as Applicant;
              Vote = (
                <Stack width="100%">
                  <GrantProgramVoting
                    data={proposal}
                    isConsortiumMember={isConsortiumMember}
                  />
                  <ListItemStatus
                    startTimestamp={proposal.startTimestamp}
                    endTimestamp={proposal.endTimestamp}
                    multisig={proposal.multisig}
                    stage={applicant.companyStage}
                    industry={applicant.companyIndustry}
                  />
                </Stack>
              );
            }
            break;
          default:
            console.warn(`Unsupport voting type ${data.type}`);
        }
        return (
          <ListItemButton
            key={proposal.id}
            divider={index !== data.data.length - 1}
            sx={{ padding: 2.5, width: '100%' }}
            onClick={() => navigate(`${data.typeId}/${proposal.id}`)}
            disableRipple
          >
            {Vote}
            {/* <ArrowForwardIos /> */}
          </ListItemButton>
        );
      })}
    </List>
  );
};
export default VotingList;
