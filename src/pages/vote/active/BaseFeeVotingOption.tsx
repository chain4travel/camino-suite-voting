import React, { useState } from 'react';
import { CheckCircle, CircleOutlined } from '@mui/icons-material';
import {
  Card as MuiCard,
  CardActionArea,
  CardContent,
  CardHeader as MuiCardHeader,
  Stack,
  Typography,
  styled,
  CardProps,
} from '@mui/material';
import type { VotingOption } from '@/types';
import Button from '@/components/Button';
import useDialog from '@/hooks/dialog';

interface StyledCardProps {
  isSelected?: boolean;
}
const StyledCard = styled((props: StyledCardProps & CardProps) => (
  <MuiCard {...props} />
))(({ theme, ...props }) => ({
  minWidth: '280px',
  boxShadow: 'none',
  background: 'transparent',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: props.isSelected
    ? theme.palette.primary.main
    : theme.palette.divider,
}));
const StyledCardHeader = styled(MuiCardHeader)({
  padding: '12px',
  '.MuiCardHeader-action': {
    marginTop: 0,
    marginBottom: 0,
  },
});
interface BaseFeeVotingOptionProps {
  data: VotingOption;
  selected: string | number | null;
  baseFee: number;
  isVoting: boolean;
  onSelect: (option: string | number | null) => void;
  onVote: () => void;
}
const BaseFeeVotingOption = ({
  data,
  selected,
  baseFee,
  isVoting,
  onSelect,
  onVote,
}: BaseFeeVotingOptionProps) => {
  const [disableRipple, setDisableRipple] = useState(false);
  const { show } = useDialog();

  const toggleSelected = () => {
    onSelect(data.option);
    disableRipple && setDisableRipple(false);
  };
  const confirmSelection = () => {
    // setDisableRipple(true);
    show({
      title: 'Are you sure?',
      message:
        'We will forword your proposal to the members connected to your multisig wallet for approval.',
      onConfirm: onVote,
    });
    // onVote();
  };
  return (
    <StyledCard
      key={`${data.option}-${data.value}`}
      isSelected={data.option === selected}
    >
      <CardActionArea onClick={toggleSelected} disableRipple>
        <StyledCardHeader
          title={`Future Base Fee ${data.value} nCAM`}
          action={
            data.option === selected ? (
              <CheckCircle color="primary" />
            ) : (
              <CircleOutlined sx={{ color: 'divider' }} />
            )
          }
          titleTypographyProps={{ variant: 'h5' }}
        />
      </CardActionArea>
      <CardContent sx={{ padding: '12px' }}>
        <Stack spacing="4px">
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Percentage Change:</Typography>
            <Typography variant="body2">
              {((Number(data.value) - baseFee) / baseFee) * 100}%
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">Absolute Change:</Typography>
            <Typography variant="body2">
              {Number(data.value) - baseFee} nCAM
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: '12px' }}
          onClick={confirmSelection}
          fullWidth
          disabled={data.option !== selected}
          loading={isVoting}
        >
          Confirm your selection
        </Button>
      </CardContent>
    </StyledCard>
  );
};
export default BaseFeeVotingOption;
