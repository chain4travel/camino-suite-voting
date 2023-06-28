import React, { useState, ChangeEvent } from 'react';
import {
  Button,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AddCircle } from '@mui/icons-material';
import type { VotingOption } from '@/types';
import { useBaseFee } from '@/hooks/useRpc';
import useToast from '@/hooks/toast';
import TextEditor from '@/components/TextEditor';
import { DateTime } from 'luxon';
import Header from '@/components/Header';
import Paragraph from '@/components/Paragraph';

const MAX_OPTIONS = 3;
const BaseFeeVoting = () => {
  const { baseFee } = useBaseFee();
  // Form fields
  const [startDate, setStartDate] = useState<DateTime | null>();
  const [endDate, setEndDate] = useState<DateTime | null>();
  const [votingOptions, setVotingOptions] = useState<VotingOption[]>([]);
  const [description, setDescription] = useState('');

  const toast = useToast();

  const handleStartDateChange = (value: DateTime | null) => {
    setStartDate(value);
  };
  const handleEndDateChange = (value: DateTime | null) => {
    setEndDate(value);
  };
  const handleAppendOption = () => {
    if (votingOptions.length === MAX_OPTIONS) {
      toast.error(`You can't add more than ${MAX_OPTIONS} options`);
    } else {
      setVotingOptions([
        ...votingOptions,
        { option: votingOptions.length, value: baseFee },
      ]);
    }
  };
  const handleOptionChange =
    (option: VotingOption) => (event: ChangeEvent<HTMLInputElement>) => {
      setVotingOptions(current =>
        current.map(opt => {
          if (opt.option === option.option) {
            return { ...opt, value: Number(event.target.value) };
          } else {
            return opt;
          }
        })
      );
    };
  return (
    <Paragraph spacing="lg">
      <Paragraph divider>
        <Header headline="Please select a voting period" variant="h6" />
        <Stack direction="row" spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InputLabel sx={{ color: 'text.secondary' }}>From</InputLabel>
            <DatePicker
              disablePast
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <InputLabel sx={{ color: 'text.secondary' }}>To</InputLabel>
            <DatePicker
              disablePast
              value={endDate}
              maxDate={startDate?.plus({ days: 30 })}
              onChange={handleEndDateChange}
            />
          </Stack>
        </Stack>
      </Paragraph>
      <Paragraph divider>
        <Header headline="Add link of forum of discussion" variant="h6" />
        <TextField variant="filled" fullWidth />
      </Paragraph>
      <Paragraph divider spacing="md">
        <Paragraph>
          <Header headline={`Current Base Fee ${baseFee} nCAM`} variant="h6" />
          <Typography variant="body2" color="text.secondary">
            Please fill the following changes of the base fee. Once selecting
            the number, it will automatically be calculated and adjusted to the
            outcomes.
          </Typography>
        </Paragraph>
        {votingOptions.map(option => (
          <Paragraph key={option.option} spacing="sm">
            <Typography variant="h6">{`${option.value} nCAM`}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <InputLabel>Select Base Fee</InputLabel>
              <TextField
                type="number"
                variant="filled"
                inputProps={{ min: 0 }}
                onChange={handleOptionChange(option)}
              />
              <Typography>nCAM</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Future Base Fee</Typography>
              <Typography>{option.value} nCAM</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Percentage Change</Typography>
              <Typography>
                {((Number(option.value) - baseFee) / baseFee) * 100}%
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Absolute Change</Typography>
              <Typography>{Number(option.value) - baseFee} nCAM</Typography>
            </Stack>
          </Paragraph>
        ))}
        <Button
          variant="text"
          startIcon={<AddCircle />}
          onClick={handleAppendOption}
          fullWidth
        >
          Add Option
        </Button>
      </Paragraph>
      <TextEditor
        title="Describe the voting"
        description="Additionally, please provide a detailed description of this voting"
        value={description}
        onChange={value => {
          setDescription(value);
        }}
      />
    </Paragraph>
  );
};
export default BaseFeeVoting;
