import React from 'react';
import { Typography } from '@mui/material';

interface HeadlineProps {
  text: string;
}
const Headline = ({ text }: HeadlineProps) => {
  return <Typography variant="h5">{text}</Typography>;
};
export default Headline;
