import { CheckCircle } from '@mui/icons-material';
import {
  Card as MuiCard,
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
  active?: boolean;
  isVoted?: boolean;
}
const StyledCard = styled(
  ({
    active: _active,
    isVoted: _isVoted,
    ...props
  }: StyledCardProps & CardProps) => <MuiCard {...props} />
)(({ theme, ...props }) => ({
  flex: 1,
  boxShadow: 'none',
  background: 'transparent',
  borderWidth: props.isVoted ? 2 : 1,
  borderStyle: 'solid',
  borderColor: props.isVoted
    ? theme.palette.text.primary
    : props.active
    ? theme.palette.grey[400]
    : theme.palette.divider,
}));
const StyledCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  paddingBottom: 0,
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
  onSelect?: (option: VotingOption | null) => void;
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
  const isSelected = option.option === selected;
  const toggleSelected = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    !hadVoted && onSelect && onSelect(option);
  };
  const confirmSelection = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onVote && onVote();
  };
  return (
    <StyledCard
      key={`${option.option}-${option.value}`}
      active={isSelected}
      isVoted={isVoted}
    >
      <StyledCardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent sx={{ padding: 2.5, paddingTop: 1.5 }}>
        {renderContent && <Stack spacing={0.5}>{renderContent(option)}</Stack>}
        {isVoted ? (
          <StateButton
            variant="contained"
            color="success"
            sx={{ marginTop: 1.5 }}
            startIcon={<CheckCircle />}
          >
            Your selection
          </StateButton>
        ) : (
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            color={isSelected ? 'success' : 'inherit'}
            sx={{ marginTop: 1.5 }}
            onClick={isSelected ? confirmSelection : toggleSelected}
            loading={isSubmitting}
            loadingPosition="start"
            startIcon={<CheckCircle />}
            disabled={hadVoted}
          >
            {isSelected ? 'Confirm selection' : 'Select'}
          </Button>
        )}
      </CardContent>
    </StyledCard>
  );
};
export default VotingOptionCard;
