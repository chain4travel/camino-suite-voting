import React from 'react';
import { List, ListItemButton, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { Applicant, Proposal } from '@/types';
import NewMemberVoting from './NewMemberVoting';
import BaseFeeVoting from './BaseFeeVoting';
import ListItemStatus from '@/components/ListItemStatus';
import ExcludeMemberVoting from './ExcludeMemberVoting';
import FeeDistributionVoting from './FeeDistributionVoting';
import GrantProgramVoting from './GrantProgram';

interface VotingListProps {
  data: { type: string; name: string; data: Proposal[] };
}
const VotingList = ({ data }: VotingListProps) => {
  const navigate = useNavigate();
  return (
    <List disablePadding>
      {data.data.map((proposal: Proposal, index: number) => {
        let Vote: JSX.Element | null = null;
        switch (data.type) {
          case 'NEW_MEMBER':
            Vote = (
              <Stack width="100%">
                <NewMemberVoting data={proposal} />
                <ListItemStatus
                  startTimestamp={proposal.startDateTime}
                  endTimestamp={proposal.endDateTime}
                  multisig={proposal.multisig}
                />
              </Stack>
            );
            break;
          case 'EXCLUDE_MEMBER':
            Vote = (
              <Stack width="100%">
                <ExcludeMemberVoting data={proposal} />
                <ListItemStatus
                  startTimestamp={proposal.startDateTime}
                  endTimestamp={proposal.endDateTime}
                  multisig={proposal.multisig}
                />
              </Stack>
            );
            break;
          case 'BASE_FEE':
            Vote = <BaseFeeVoting data={proposal} />;
            break;
          case 'FEE_DISTRIBUTION':
            Vote = <FeeDistributionVoting data={proposal} />;
            break;
          case 'GRANT':
            {
              const applicant = proposal.target! as Applicant;
              Vote = (
                <Stack width="100%">
                  <GrantProgramVoting data={proposal} />
                  <ListItemStatus
                    startTimestamp={proposal.startDateTime}
                    endTimestamp={proposal.endDateTime}
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
            onClick={() => navigate(`${data.type}/${proposal.id}`)}
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
