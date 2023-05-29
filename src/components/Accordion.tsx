import {
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  styled,
} from '@mui/material';

const Accordion = styled(MuiAccordion)({
  background: 'transparent',
});
const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  '&.Mui-expanded': {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  '.MuiAccordionSummary-expandIconWrapper': {
    color: theme.palette.text.secondary,
  },
}));
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderTop: 0,
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
}));
export { Accordion, AccordionSummary, AccordionDetails };
