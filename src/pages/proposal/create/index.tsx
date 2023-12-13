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
import AdminNewMemberForm, {
  adminNewMemberFormSchema,
} from './AdminNewMemberForm';
import ExcludeMemberVoting, {
  excludeMemberFormSchema,
} from './ExcludeMemberForm';
import AdminExcludeMemberVoting, {
  adminExcludeMemberFormSchema,
} from './AdminExcludeMemberForm';
import FeeDistributionForm, {
  feeDistributionFormSchema,
} from './FeeDistributionForm';
import GeneralProposalForm, { generalFormSchema } from './GeneralProposalForm';
import GrantProgramForm, { grantProgramFormSchema } from './GrantProgramForm';
import useWallet from '@/hooks/useWallet';
import { filter, find } from 'lodash';

const CreateNewVoting = () => {
  const {
    signer,
    pchainAPI,
    isConsortiumMember,
    currentWalletAddress,
    isConsortiumAdminProposer,
    isCaminoProposer,
    isKycVerified,
  } = useWallet();
  const { data: proposalTypes } = useLoaderData() as { data: ProposalType[] };
  const [availableProposalTypes, setAvailableProposalTypes] =
    useState(proposalTypes);
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
        formSchema = newMemberFormSchema(pchainAPI);
        break;
      case ProposalTypes.AdminNewMember:
        ProposalForm = <AdminNewMemberForm />;
        formSchema = adminNewMemberFormSchema(pchainAPI);
        break;
      case ProposalTypes.ExcludeMember:
        ProposalForm = <ExcludeMemberVoting />;
        formSchema = excludeMemberFormSchema(pchainAPI);
        break;
      case ProposalTypes.AdminExcludeMember:
        ProposalForm = <AdminExcludeMemberVoting />;
        formSchema = adminExcludeMemberFormSchema(pchainAPI);
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

  useEffect(() => {
    let types: ProposalType[] = [];
    // Check address state of admin proposer
    if (isConsortiumAdminProposer) {
      const adminProposalTypes = filter(
        proposalTypes,
        ptype => !!ptype.isAdminProposal
      );
      types = [...types, ...adminProposalTypes];
    }
    // Check address state of KYC-verified
    if (isKycVerified) {
      const kycVerifiedTypes = filter(
        proposalTypes,
        ptype => !ptype.restricted
      );
      types = [...types, ...kycVerifiedTypes];
    }
    // Check address state of C-member
    if (!isConsortiumMember) {
      setAvailableProposalTypes(types);
    } else {
      // Check running validator
      pchainAPI?.getCurrentValidators().then(result => {
        const hasValidator = find(
          (result as { validators: any[] }).validators,
          validator =>
            validator.rewardOwner.addresses.includes(currentWalletAddress)
        );
        if (hasValidator) {
          const consortiumMemberProposalTypes = filter(
            proposalTypes,
            ptype => !!ptype.consortiumMemberOnly
          );
          types = [...types, ...consortiumMemberProposalTypes];
          // Check address state of camino-only proposer
          if (isCaminoProposer) {
            const caminoProposalTypes = filter(
              proposalTypes,
              ptype => !!ptype.caminoOnly
            );
            types = [...types, ...caminoProposalTypes];
          }
        }
        setAvailableProposalTypes(types);
      });
    }
  }, [isConsortiumMember, isConsortiumAdminProposer, currentWalletAddress]);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const {
      target: { value },
    } = event;
    setSelectedProposalType(Number(value));
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
        {availableProposalTypes.map(pType => (
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
          onCancel={() => setSelectedProposalType(-1)}
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
