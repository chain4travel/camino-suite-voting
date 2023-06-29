import React, { useMemo, useState } from 'react';
import {
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
import BaseFeeVoting, { baseFeeFormSchema } from './BaseFeeVoting';
import EssentialForm from './EssentialForm';
import NewMemberVoting, { newMemberFormSchema } from './NewMemberVoting';
import ExcludeMemberVoting, {
  excludeMemberFormSchema,
} from './ExcludeMemberVoting';
import FormContainer from './FormContainer';

const CreateNewVoting = () => {
  const { data: votingTypes } = useLoaderData() as { data: VotingType[] };
  const [selectedVotingType, setSelectedVotingType] = useState<string>('0');

  const handleChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setSelectedVotingType(value);
  };

  const { ProposalForm, formSchema } = useMemo(() => {
    let ProposalForm, formSchema;
    switch (selectedVotingType) {
      case 'BASE_FEE':
        ProposalForm = <BaseFeeVoting />;
        formSchema = baseFeeFormSchema;
        break;
      case 'NEW_MEMBER':
        ProposalForm = <NewMemberVoting />;
        formSchema = newMemberFormSchema;
        break;
      case 'EXCLUDE_MEMBER':
        ProposalForm = <ExcludeMemberVoting />;
        formSchema = excludeMemberFormSchema;
        break;
      default:
        console.warn(`Unsupported voting type ${selectedVotingType}`);
        ProposalForm = <NoVotingType />;
    }
    return {
      ProposalForm,
      formSchema,
    };
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
      {formSchema ? (
        <EssentialForm formSchema={formSchema}>{ProposalForm}</EssentialForm>
      ) : (
        ProposalForm
      )}
    </Container>
  );
};
export default CreateNewVoting;
