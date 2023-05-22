import React, { useState } from 'react';
import { CheckCircle, CircleOutlined } from '@mui/icons-material';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { Proposal } from '@/types';
import { useBaseFee } from '@/hooks/useRpc';

const useStyles = makeStyles(() => ({
  action: { marginTop: 0, marginRight: 0 },
}));
interface BaseFeeVotingProps {
  data: Proposal;
  disableParentRipple: (disabled: boolean) => void;
}
const BaseFeeVoting = ({ data, disableParentRipple }: BaseFeeVotingProps) => {
  const { palette } = useTheme();
  const classes = useStyles();
  const [selectToVote, setSelectToVote] = useState<number | null>(null);
  const [disableRipple, setDisableRipple] = useState(false);
  const { baseFee } = useBaseFee();

  const toggleSelected = (option: number) => {
    setSelectToVote(selectToVote === option ? null : option);
    disableParentRipple(true);
    disableRipple && setDisableRipple(false);
  };
  const confirmSelection = () => {
    setDisableRipple(true);
  };
  return (
    <Stack direction="row" sx={{ marginRight: '24px' }} spacing="24px">
      {data.options.map(opt => (
        <Card
          key={`${opt.option}-${opt.value}`}
          sx={{
            minWidth: '280px',
            boxShadow: 'none',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          }}
        >
          <CardActionArea
            onClick={() => toggleSelected(opt.option)}
            disableRipple={disableRipple}
          >
            <CardHeader
              title={`Future Base Fee ${opt.value} nCAM`}
              action={
                opt.option === selectToVote ? (
                  <CheckCircle color="primary" />
                ) : (
                  <CircleOutlined sx={{ color: 'grey.600' }} />
                )
              }
              sx={{ padding: '12px' }}
              titleTypographyProps={{ sx: { fontSize: '18px' } }}
              classes={{ action: classes.action }}
              className={classes.action}
            />
            <CardContent sx={{ padding: '12px' }}>
              <Stack spacing="4px">
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Percentage Change:</Typography>
                  <Typography variant="body2">
                    {((Number(opt.value) - baseFee) / baseFee) * 100}%
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Absolute Change:</Typography>
                  <Typography variant="body2">
                    {Number(opt.value) - baseFee} nCAM
                  </Typography>
                </Stack>
              </Stack>
              <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: '12px' }}
                onClick={confirmSelection}
                fullWidth
              >
                Confirm your selection
              </Button>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
};
export default BaseFeeVoting;
