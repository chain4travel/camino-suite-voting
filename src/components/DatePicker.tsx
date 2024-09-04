import { styled } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

const CaminoDatePicker = styled(DatePicker)(theme => ({
  minWidth: '300px',
  '& .MuiInputBase-root': {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '12px',
  },
  '& .MuiInputBase-input': {
    height: '40px',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 'normal',
    font: 'Inter',
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    fontWeight: 'normal',
    transform: 'translate(14px, 10px) scale(1)',
    transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1)',
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(0, -10px) scale(0.9)',
    left: '14px',
  },
}));
export default CaminoDatePicker;
