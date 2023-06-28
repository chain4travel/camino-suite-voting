import React from 'react';
import { Check, CheckCircle, CircleOutlined } from '@mui/icons-material';
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
import StateButton from '@/components/StateButton';

interface StyledCardProps {
  isSelected?: boolean;
  isVoted?: boolean;
}
const StyledCard = styled(
  ({
    isSelected: _isSelected,
    isVoted: _isVoted,
    ...props
  }: StyledCardProps & CardProps) => <MuiCard {...props} />
)(({ theme, ...props }) => ({
  minWidth: '280px',
  boxShadow: 'none',
  background: 'transparent',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: props.isVoted
    ? theme.palette.accent.main
    : props.isSelected
    ? theme.palette.primary.main
    : theme.palette.divider,
}));
const StyledCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  padding: theme.spacing(1.5),
  '.MuiCardHeader-action': {
    marginTop: 0,
    marginBottom: 0,
  },
}));
interface BaseFeeVotingOptionProps {
  data: VotingOption;
  selected: string | number | null;
  baseFee: number;
  isVoting: boolean;
  isVoted: boolean;
  onSelect: (option: string | number | null) => void;
  onVote: () => void;
}
const BaseFeeVotingOption = ({
  data,
  selected,
  baseFee,
  isVoting,
  isVoted = false,
  onSelect,
  onVote,
}: BaseFeeVotingOptionProps) => {
  const toggleSelected = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    !isVoted && onSelect(data.option);
  };
  const confirmSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onVote();
  };
  return (
    <StyledCard
      key={`${data.option}-${data.value}`}
      isSelected={data.option === selected}
      isVoted={isVoted}
    >
      <CardActionArea onClick={toggleSelected} disableRipple>
        <StyledCardHeader
          title={`Future Base Fee ${data.value} nCAM`}
          action={
            isVoted ? null : data.option === selected ? (
              <CheckCircle color="primary" />
            ) : (
              <CircleOutlined sx={{ color: 'divider' }} />
            )
          }
          titleTypographyProps={{ variant: 'h6' }}
        />
      </CardActionArea>
      <CardContent sx={{ padding: 1.5 }}>
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Percentage Change:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {((Number(data.value) - baseFee) / baseFee) * 100}%
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Absolute Change:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Number(data.value) - baseFee} nCAM
            </Typography>
          </Stack>
        </Stack>
        {isVoted ? (
          <StateButton
            variant="text"
            color="accent"
            sx={{ marginTop: 1.5 }}
            fullWidth
            startIcon={<Check />}
          >
            Your selection
          </StateButton>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 1.5 }}
            onClick={confirmSelection}
            fullWidth
            disabled={data.option !== selected}
            loading={isVoting}
          >
            Confirm your selection
          </Button>
        )}
      </CardContent>
    </StyledCard>
  );
};
export default BaseFeeVotingOption;
