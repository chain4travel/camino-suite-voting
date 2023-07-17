import React from 'react';
import { DateTime } from 'luxon';
import { ChipProps, Stack } from '@mui/material';
import { MultisigVote } from '@/types';
import Tag from './Tag';

interface ListItemStatusProps extends ChipProps {
  startTimestamp?: number;
  endTimestamp?: number;
  multisig?: MultisigVote;
  stage?: string;
  industry?: string;
}
const ListItemStatus = ({
  startTimestamp,
  endTimestamp,
  multisig,
  stage,
  industry,
  ...props
}: ListItemStatusProps) => {
  let duration;
  if (startTimestamp && endTimestamp) {
    const startDateTime = DateTime.fromSeconds(startTimestamp);
    const endDateTime = DateTime.fromSeconds(endTimestamp);
    const isNotStartYet =
      startDateTime.startOf('day') > DateTime.now().startOf('day');
    duration = isNotStartYet
      ? startDateTime.toFormat('dd.MM.yyyy hh:mm:ss a')
      : endDateTime
          .diffNow(['days', 'hours', 'minutes'])
          .toFormat("dd'd' hh'h' mm'm'");
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Tag {...props} label={duration} />
      {multisig && multisig.voted?.count && (
        <Tag
          color="warning"
          label={`${multisig.voted?.count} / ${multisig.threshold} PENDING`}
        />
      )}
      {stage && <Tag color="success" label={stage.toUpperCase()} />}
      {industry && <Tag label={industry.toUpperCase()} />}
    </Stack>
  );
};
export default ListItemStatus;
