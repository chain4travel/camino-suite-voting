import { PendingMultisigTx } from '@/types';
import { Box, ChipProps } from '@mui/material';
import { countBy } from 'lodash';
import { DateTime } from 'luxon';
import React from 'react';
import Tag from './Tag';

interface ListItemStatusProps extends ChipProps {
  startTimestamp?: number;
  endTimestamp?: number;
  pendingMultisigTx?: PendingMultisigTx;
  stage?: string;
  industry?: string;
  status?: string;
  isCompleted?: boolean;
}
const ListItemStatus = ({
  startTimestamp,
  endTimestamp,
  pendingMultisigTx,
  stage,
  industry,
  status,
  isCompleted,
  ...props
}: ListItemStatusProps) => {
  let duration;
  if (startTimestamp && endTimestamp) {
    const startDateTime = DateTime.fromSeconds(startTimestamp);
    const endDateTime = DateTime.fromSeconds(endTimestamp);
    const now = DateTime.now();
    const isNotStartYet = startDateTime > now;
    const isEnded = isCompleted || now > endDateTime;
    duration =
      isNotStartYet || isEnded
        ? startDateTime.toFormat('dd.MM.yyyy hh:mm:ss a')
        : endDateTime
            .diffNow(['days', 'hours', 'minutes'])
            .toFormat("dd'd' hh'h' mm'm'");
  }

  let signedCount = 0;
  if (pendingMultisigTx) {
    signedCount =
      countBy(pendingMultisigTx.owners, o => !!o.signature).true ?? 0;
  }
  return (
    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {duration && <Tag {...props} label={duration} />}
      {pendingMultisigTx && (
        <Tag
          color="warning"
          label={`${signedCount} / ${pendingMultisigTx.threshold} PENDING`}
        />
      )}
      {stage && <Tag color="success" label={stage.toUpperCase()} />}
      {industry && <Tag label={industry.toUpperCase()} />}
      {status && <Tag label={status} />}
    </Box>
  );
};
export default React.memo(ListItemStatus);
