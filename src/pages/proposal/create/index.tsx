import React, { useMemo, useState } from 'react';
import {
  Container,
  Divider,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useLoaderData } from 'react-router-dom';
import Header from '@/components/Header';
import type { VotingType } from '@/types';
import NoVotingType from './NoVotingType';
import BaseFeeForm, { baseFeeFormSchema } from './BaseFeeForm';
import EssentialForm from './EssentialForm';
import NewMemberForm, { newMemberFormSchema } from './NewMemberForm';
import ExcludeMemberVoting, {
  excludeMemberFormSchema,
} from './ExcludeMemberForm';
import FeeDistributionForm, {
  feeDistributionFormSchema,
} from './FeeDistributionForm';

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
        ProposalForm = <BaseFeeForm />;
        formSchema = baseFeeFormSchema;
        break;
      case 'NEW_MEMBER':
        ProposalForm = <NewMemberForm />;
        formSchema = newMemberFormSchema;
        break;
      case 'EXCLUDE_MEMBER':
        ProposalForm = <ExcludeMemberVoting />;
        formSchema = excludeMemberFormSchema;
        break;
      case 'FEE_DISTRIBUTION':
        ProposalForm = <FeeDistributionForm />;
        formSchema = feeDistributionFormSchema;
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
      <Divider sx={{ marginY: 4 }} />
      {formSchema ? (
        <EssentialForm formSchema={formSchema}>{ProposalForm}</EssentialForm>
      ) : (
        ProposalForm
      )}
    </Container>
  );
};
export default CreateNewVoting;
