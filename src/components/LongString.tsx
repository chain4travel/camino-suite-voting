import {
  displayFirstPartLongString,
  displaySecondPartLongString,
} from '@/helpers/string';
import { Typography } from '@mui/material';
import React from 'react';

const LongString = ({ value }: { value: string }) => {
  const content =
    value && value.length < 12 ? (
      <Typography>{value}</Typography>
    ) : (
      <Typography>
        {displayFirstPartLongString(value)}&hellip;
        {displaySecondPartLongString(value)}
      </Typography>
    );
  return <>{content}</>;
};
export default React.memo(LongString);
