import ListItemStatus from '@/components/ListItemStatus';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import { getOptionLabel } from '@/helpers/util';
import type { Proposal, VotingOption } from '@/types';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

interface NewMemberVoteProps {
  data: Proposal;
  voteTypeName?: string;
}
const NewMemberVote = ({ data, voteTypeName }: NewMemberVoteProps) => {
  const outcome: VotingOption[] = useMemo(
    () => data.options.filter(opt => data.outcome === opt.option),
    [data.outcome]
  );

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '0px 12px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: '1 1 60%',
        }}
      >
        <Typography variant="body2">
          {(data.target as string) ?? voteTypeName}
        </Typography>
        <Typography
          variant="caption"
          className="clamp-3-lines"
          sx={{
            color: '#CBD5E1',
          }}
        >
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
          commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus
          et magnis dis parturient montes, nascetur ridiculus mus. Donec quam
          felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla
          consequat massa quis enim. Donec pede justo, fringilla vel, aliquet
          nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a,
          venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium.
          Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean
          vulputate eleifend tellus.
        </Typography>
        <ListItemStatus
          startTimestamp={data.startTimestamp}
          endTimestamp={data.endTimestamp}
          isCompleted
        />
      </Box>
      <Box>
        {outcome.map(voted => (
          <StateButton
            variant="contained"
            key={voted.option}
            startIcon={voted.value ? <CheckCircle /> : <Cancel />}
            color={voted.value ? 'success' : 'error'}
          >
            {toPastTense(String(getOptionLabel(voted)))}
          </StateButton>
        ))}
        {outcome.length === 0 && (
          <StateButton variant="contained">Failed</StateButton>
        )}
      </Box>
    </Box>
  );
  return content;
  // return (
  //   <Stack direction="row" spacing={2.5} alignItems="flex-end">
  //     <ListItemText
  //       primary={(data.target as string) ?? voteTypeName}
  //       secondary={
  //         <Typography
  //           color="text.secondary"
  //           style={{
  //             display: '-webkit-box',
  //             WebkitLineClamp: 2,
  //             textOverflow: 'ellipsis',
  //             overflow: 'hidden',
  //             WebkitBoxOrient: 'vertical',
  //           }}
  //           variant="body2"
  //           dangerouslySetInnerHTML={{
  //             __html: sanitizeHtml(
  //               data.description ??
  //                 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus.'
  //             ),
  //           }}
  //         />
  //       }
  //     />
  //     {outcome.map(voted => (
  //       <StateButton
  //         variant="contained"
  //         key={voted.option}
  //         startIcon={voted.value ? <CheckCircle /> : <Cancel />}
  //         color={voted.value ? 'success' : 'error'}
  //       >
  //         {toPastTense(String(getOptionLabel(voted)))}
  //       </StateButton>
  //     ))}
  //     {outcome.length === 0 && (
  //       <StateButton variant="contained">Failed</StateButton>
  //     )}
  //   </Stack>
  // );
};
export default React.memo(NewMemberVote);
