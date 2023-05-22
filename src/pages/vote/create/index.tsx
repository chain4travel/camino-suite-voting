import React from 'react';
import {
  Container,
  Divider,
  Button,
  Typography,
  Autocomplete,
  Box,
  TextField,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import TextEditor from '../../../components/TextEditor';

function CreateProposal() {
  const { category } = useParams();
  const userAddress = [{ label: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy' }];
  const typeOfCompany = [
    { label: 'Tech Partners' },
    { label: 'Consulting' },
    { label: 'Distribution' },
    { label: 'Finance' },
    { label: 'Aerospace' },
    { label: 'Hospitality' },
    { label: 'Data Insights' },
    { label: 'Loyalty Reviews' },
    { label: 'Customer Engagement' },
    { label: 'OTHERS' },
  ];
  return (
    <>
      <Container>
        {category === 'new_consortium_member' && (
          <Box sx={{ mt: 5 }}>
            <Typography>
              Please select wallet address of the consortium memeber you want to
              vote exclude out of the consortium
            </Typography>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={userAddress}
              sx={{ width: 500, mt: 1, mb: 1, borderRadius: '4px' }}
              renderInput={params => (
                <TextField {...params} label="Wallet Address" />
              )}
            />

            <Box sx={{ mt: 5 }}>
              <Typography variant="h4">Define</Typography>
              <Typography sx={{ mt: 1, mb: 1 }}>
                Please explain in detail why you want to propose an exclusion of
                that particular member from the consortium.
              </Typography>
              <TextEditor />
              <Typography sx={{ mb: 2 }}>
                <Button variant="outlined">submit</Button>
              </Typography>
            </Box>
          </Box>
        )}

        {category === 'exclusions' && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" marginTop={4} paddingX={2}>
              Vote for new members to be part of the consortium
            </Typography>
            <Divider sx={{ marginY: 3 }} />

            <Container>
              <Typography variant="h5" sx={{ mt: 1, mb: 1 }}>
                Application Text
              </Typography>
              <Typography variant="body2">
                Why do you want to join the Camino Consortium? Please specify
                here
              </Typography>
              <TextEditor />
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={typeOfCompany}
                  sx={{ width: 300 }}
                  renderInput={params => (
                    <TextField {...params} label="Type of Company" />
                  )}
                />
                <TextField
                  sx={{ width: '300px', marginLeft: '200px' }}
                  id="outlined-basic"
                  label="Enter Node ID (not public)"
                  variant="outlined"
                />
              </Box>
              <Typography sx={{ mb: 2 }}>
                <Button variant="outlined">submit</Button>
              </Typography>
            </Container>
          </Box>
        )}
      </Container>
    </>
  );
}

export default CreateProposal;
