import { Check, CheckCircle, CircleOutlined } from '@mui/icons-material';
import {
  Card as MuiCard,
  CardActionArea,
  CardProps,
  styled,
  CardHeader as MuiCardHeader,
  CardContent,
  Stack,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { find } from 'lodash';
import Button from '@/components/Button';
import StateButton from '@/components/StateButton';
import { Vote, VotingOption } from '@/types';

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

interface VotingOptionProps {
  option: VotingOption;
  title?: string;
  voted?: Vote[];
  isSubmitting?: boolean;
  selected?: string | number | null;
  children?: ReactNode;
  renderContent?: (option: VotingOption) => ReactNode;
  onSelect?: (option: string | number | null) => void;
  onVote?: () => void;
}
const VotingOptionCard = ({
  option,
  title,
  voted,
  isSubmitting,
  selected,
  renderContent,
  onSelect,
  onVote,
}: VotingOptionProps) => {
  const hadVoted = voted && voted.length > 0;
  const isVoted = !!find(voted, v => v.option === option.option);
  const toggleSelected = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    !hadVoted && onSelect && onSelect(option.option);
  };
  const confirmSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onVote && onVote();
  };
  return (
    <StyledCard
      key={`${option.option}-${option.value}`}
      isSelected={option.option === selected}
      isVoted={isVoted}
    >
      <CardActionArea onClick={toggleSelected} disableRipple>
        <StyledCardHeader
          title={title}
          action={
            hadVoted ? null : option.option === selected ? (
              <CheckCircle color="primary" />
            ) : (
              <CircleOutlined sx={{ color: 'divider' }} />
            )
          }
          titleTypographyProps={{ variant: 'h6' }}
        />
      </CardActionArea>
      <CardContent sx={{ padding: 1.5 }}>
        {renderContent && <Stack spacing={0.5}>{renderContent(option)}</Stack>}
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
            disabled={option.option !== selected}
            loading={isSubmitting}
          >
            Confirm your selection
          </Button>
        )}
      </CardContent>
    </StyledCard>
  );
};
export default VotingOptionCard;
