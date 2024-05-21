import { Paper as MuiPaper, styled } from '@mui/material';

const Paper = styled(MuiPaper)(() => ({
  boxShadow: 'none',
  backgroundImage: 'none',
  border: 'none',
}));
export default Paper;
