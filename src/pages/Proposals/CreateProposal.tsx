import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Container from '@mui/material/Container';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import ProposalNavbar from '../../components/ProposalNavbar';

function CreateProposal() {
  const top100Films = [
    { label: 'The Shawshank Redemption', year: 1994 },
    { label: 'The Godfather', year: 1972 },
    { label: 'The Godfather: Part II', year: 1974 },
    { label: 'The Dark Knight', year: 2008 },
    { label: '12 Angry Men', year: 1957 },
    { label: "Schindler's List", year: 1993 },
    { label: 'Pulp Fiction', year: 1994 },
  ];
  return (
    <>
      <ProposalNavbar />
      <Container sx={{ py: 2, px: { md: 1 } }}>
        <Box>
          Please select wallet address of the consortium memeber you want to
          vote exclude out of the consortium: Create Proposal
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={top100Films}
            sx={{ width: 300 }}
            renderInput={params => <TextField {...params} label="Movie" />}
          />
          <TextareaAutosize
            aria-label="minimum height"
            minRows={3}
            placeholder="Minimum 3 rows"
            style={{ width: 200 }}
          />
        </Box>
      </Container>
    </>
  );
}

export default CreateProposal;
