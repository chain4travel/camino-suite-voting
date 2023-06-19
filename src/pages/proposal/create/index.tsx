import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import Header from '@/components/Header';
import type { VotingType } from '@/types';
import NoVotingType from './NoVotingType';
import BaseFeeVoting from './BaseFeeVoting';

const CreateNewVoting = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const [selectedVotingType, setSelectedVotingType] = useState<string>('0');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setSelectedVotingType(value);
  };

  const ProposalForm = useMemo(() => {
    switch (selectedVotingType) {
      case 'BASE_FEE':
        return <BaseFeeVoting />;
      default:
        console.warn(`Unsupported voting type ${selectedVotingType}`);
        return <NoVotingType />;
    }
  }, [selectedVotingType]);
  return (
    <Container>
      <Header headline="Create Proposal" variant="h2" fontFamily="Inter" />
      <Header headline="Voting type" variant="h6" />
      <Typography variant="body2" color="text.secondary">
        Please select the voting you want to start and we will show you all
        needed information and additional informations
      </Typography>
      <Select
        fullWidth
        value={selectedVotingType}
        renderValue={selected => {
          if (selected === '0') {
            return 'Please choose...';
          }
          const selectedType = votingTypes.find(vtype => vtype.id === selected);
          return selectedType?.name;
        }}
        onChange={handleChange}
        variant="filled"
        sx={{ marginTop: '16px', borderRadius: '12px' }}
      >
        <MenuItem
          key="placeholder"
          value="0"
          hidden
          sx={{ padding: 0 }}
        ></MenuItem>
        {votingTypes.map(vtype => (
          <MenuItem key={vtype.id} value={vtype.id}>
            {vtype.name}
          </MenuItem>
        ))}
      </Select>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{
          marginTop: '20px',
          minHeight: '300px',
          border: 1,
          borderColor: 'divider',
          borderRadius: '12px',
          padding: '24px 20px',
        }}
      >
        {ProposalForm}
      </Box>
      <Stack direction="row" spacing="16px" marginTop="20px">
        <Button
          variant="outlined"
          sx={{ paddingTop: '12px', paddingBottom: '12px' }}
          color="inherit"
          fullWidth
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{ paddingTop: '12px', paddingBottom: '12px' }}
          color="primary"
          disabled={!selectedVotingType}
          fullWidth
        >
          Create new voting
        </Button>
      </Stack>
    </Container>
  );
};
export default CreateNewVoting;
