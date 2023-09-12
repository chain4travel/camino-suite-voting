import React, { useEffect, useMemo, useState } from 'react';
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
import { ProposalTypes, type ProposalType } from '@/types';
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
import GeneralProposalForm, { generalFormSchema } from './GeneralProposalForm';
import GrantProgramForm, { grantProgramFormSchema } from './GrantProgramForm';
import useWallet from '@/hooks/useWallet';

const CreateNewVoting = () => {
  const { signer } = useWallet();
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const [selectedProposalType, setSelectedProposalType] = useState<number>(-1);

  const { ProposalForm, formSchema } = useMemo(() => {
    let ProposalForm, formSchema;
    const proposalType = Object.values(ProposalTypes)[selectedProposalType];
    switch (proposalType) {
      case ProposalTypes.BaseFee:
        ProposalForm = <BaseFeeForm />;
        formSchema = baseFeeFormSchema;
        break;
      case ProposalTypes.General:
        ProposalForm = <GeneralProposalForm />;
        formSchema = generalFormSchema;
        break;
      case ProposalTypes.NewMember:
        ProposalForm = <NewMemberForm />;
        formSchema = newMemberFormSchema;
        break;
      case ProposalTypes.ExcludeMember:
        ProposalForm = <ExcludeMemberVoting />;
        formSchema = excludeMemberFormSchema;
        break;
      case ProposalTypes.FeeDistribution:
        ProposalForm = <FeeDistributionForm />;
        formSchema = feeDistributionFormSchema;
        break;
      case ProposalTypes.GrantProgram:
        ProposalForm = <GrantProgramForm />;
        formSchema = grantProgramFormSchema;
        break;
      default:
        console.warn(`Unsupported voting type ${selectedProposalType}`);
        ProposalForm = <NoVotingType />;
    }
    return {
      ProposalForm,
      formSchema,
    };
  }, [selectedProposalType]);

  useEffect(() => {
    if (!signer) {
      location.pathname = '/login';
    }
  }, [signer]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setSelectedProposalType(value);
  };

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
        value={selectedProposalType}
        renderValue={(selected: number) => {
          if (selected === -1) {
            return 'Please choose...';
          }
          const selectedType = proposalTypes.find(
            vtype => vtype.id === selected
          );
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
        {proposalTypes
          .filter(pType => !pType.disabled)
          .map(pType => (
            <MenuItem key={pType.id} value={pType.id}>
              {pType.name}
            </MenuItem>
          ))}
      </Select>
      <Divider sx={{ marginY: 4 }} />
      {formSchema ? (
        <EssentialForm
          proposalType={selectedProposalType}
          formSchema={formSchema}
        >
          {ProposalForm}
        </EssentialForm>
      ) : (
        ProposalForm
      )}
    </Container>
  );
};
export default CreateNewVoting;
