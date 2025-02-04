import React, { useMemo } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Box, ListItemText, Stack, Typography } from '@mui/material';
import type { Proposal, VotingOption } from '@/types';
import StateButton from '@/components/StateButton';
import { toPastTense } from '@/helpers/string';
import ListItemStatus from '@/components/ListItemStatus';
import { useProposalDescription } from '@/hooks/useProposalDescription';
import { getOptionLabel, sanitizeOptions } from '@/helpers/util';
import { Serialization } from '@c4tplatform/caminojs/dist/utils';
import sanitizeHtml from 'sanitize-html';

const serialization = Serialization.getInstance();

interface GeneralVoteProps {
  data: Proposal;
  voteTypeName?: string;
}
const GeneralVote = ({ data, voteTypeName }: GeneralVoteProps) => {
  const outcome: VotingOption[] = useMemo(
    () => data.options.filter(opt => data.outcome === opt.option),
    [data.outcome]
  );
  const { isLoading, error, description } = useProposalDescription(data.id);
  return (
    <Box
      sx={{
        width: '100%',
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
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(
              data.memo
                ? serialization.decoder(
                    data.memo as string,
                    'base64',
                    'base64',
                    'utf8'
                  )
                : 'No Title Provided',
              sanitizeOptions
            ),
          }}
        ></Typography>
        {isLoading ? (
          <Box
            sx={{
              width: '100%',
              height: '20px',
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
          />
        ) : error ? (
          <Typography variant="caption" color="error">
            Failed to load description
          </Typography>
        ) : (
          <Typography
            component="caption"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              textAlign: 'start',
            }}
            variant="caption"
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        )}

        <ListItemStatus
          startTimestamp={data.startTimestamp}
          endTimestamp={data.endTimestamp}
          isCompleted
        />
      </Box>
      <Box>
        {outcome.map(voted => {
          if (typeof voted.value === 'string')
            return (
              <StateButton
                variant="contained"
                key={voted.option}
                startIcon={voted.value ? <CheckCircle /> : <Cancel />}
                color={voted.value ? 'success' : 'error'}
              >
                {toPastTense(
                  String(
                    getOptionLabel({
                      label: serialization.decoder(
                        voted.value as string,
                        'base64',
                        'base64',
                        'utf8'
                      ) as string,
                      option: voted.option,
                      value: voted.value,
                    })
                  )
                )}{' '}
              </StateButton>
            );
        })}
        {outcome.length === 0 && (
          <StateButton variant="contained" color="error">
            Failed
          </StateButton>
        )}
      </Box>
    </Box>
  );
};
export default GeneralVote;
