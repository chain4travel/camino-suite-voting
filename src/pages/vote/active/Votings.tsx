import React, { useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import { DateTime } from 'luxon';
import type { Proposal } from '@/types';
import NewMemberVoting from './NewMemberVoting';
import BaseFeeVoting from './BaseFeeVoting';

interface VotingsProps {
  data: { type: string; name: string; data: Proposal[] };
}
const Votings = ({ data }: VotingsProps) => {
  const [disableRipple, setDisableRipple] = useState(false);
  return (
    <List disablePadding>
      {data.data.map((proposal: any) => {
        const startDateTime = DateTime.fromSeconds(proposal.startDateTime);
        const endDateTime = DateTime.fromSeconds(proposal.endDateTime);
        const isNotStartYet =
          startDateTime.startOf('day') > DateTime.now().startOf('day');
        const duration = isNotStartYet
          ? startDateTime.toFormat('dd MM yyyy hh:mm:ss a')
          : endDateTime
              .diffNow(['days', 'hours', 'minutes'])
              .toFormat("dd'd' hh'h' mm'm'");

        let Vote: JSX.Element | null = null;
        switch (data.type) {
          case 'NEW_MEMBER':
            Vote = (
              <NewMemberVoting
                data={proposal}
                disableParentRipple={setDisableRipple}
              />
            );
            break;
          case 'BASE_FEE':
            Vote = (
              <BaseFeeVoting
                data={proposal}
                disableParentRipple={setDisableRipple}
              />
            );
            break;
          default:
            console.warn(`Unsupport voting type ${data.type}`);
        }
        return (
          <ListItemButton
            key={proposal.id}
            divider
            disableRipple={disableRipple}
            onClick={() => disableRipple && setDisableRipple(false)}
          >
            <ListItemText
              primary={duration}
              sx={{ flex: 'none', width: '100px', marginRight: '24px' }}
              primaryTypographyProps={{
                sx: { textAlign: 'right', fontWeight: 700 },
              }}
            />
            {Vote}
            <ArrowForwardIos />
          </ListItemButton>
        );
      })}
    </List>
  );
};
export default Votings;
