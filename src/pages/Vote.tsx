import * as React from 'react';
import ProposalCard from '../components/ProposalCard';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';

export default function App() {
  type Proposal = {
    title: string;
    ctx: string;
    btnCtx: string;
    url: string;
  };

  const ProposalList: Proposal[] = [
    {
      title: 'New Validator',
      ctx: 'Has been admitted as a validator by the validator consortia via a vote The last condition is omitted for Validators who secure the network from the start.',
      btnCtx: 'New Validator',
      url: 'new_consortium_member',
    },
    {
      title: 'Vote for exclusion of consortium member',
      ctx: 'CAM is the native token of Camino. It’s a hard-capped, scarce asset that is used to pay for fees, secure the platform through staking, and provide a basic unit of account between the multiple subnets created on Camino.',
      btnCtx: 'New Proposal',
      url: 'exclude_consortium_member',
    },
  ];

  return (
    <Grid container direction="row" alignItems="center">
      {ProposalList.map(v => (
        <Link to={`/vote/${v.url}`} key={v.url}>
          <ProposalCard
            title={v.title}
            ctx={v.ctx}
            btnCtx={v.btnCtx}
            url={v.url}
          />
        </Link>
      ))}
    </Grid>
  );
}
