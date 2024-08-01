import {
  displayFirstPartLongString,
  displaySecondPartLongString,
} from '@/helpers/string';
import useWidth from '@/hooks/useWidth';
import { Typography } from '@mui/material';
import React from 'react';

const LongString = ({ value }: { value: string }) => {
  const { isSmallMobile, isMobile } = useWidth();
  const maxLenght = isSmallMobile ? 8 : isMobile ? 25 : 40;
  const content =
    value && (value.length < 12 || maxLenght === 40) ? (
      <Typography>{value}</Typography>
    ) : (
      <Typography>
        {displayFirstPartLongString(value, maxLenght)}&hellip;
        {displaySecondPartLongString(value, maxLenght)}
      </Typography>
    );
  return <>{content}</>;
};
export default React.memo(LongString);
