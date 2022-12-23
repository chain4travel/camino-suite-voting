import React, { ChangeEvent, useState } from 'react';
import {
  Container,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';

import { Proposal } from '@apis/proposals';
import { useProposals } from '@hooks/proposals';
import ProposalNavbar from '../../components/ProposalNavbar';

const ProposalList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { category } = useParams();
  console.log('type: ', category);
  const { proposals, totalCount } = useProposals(category, page, rowsPerPage);

  const handleChangePage = (event: unknown, toPage: number) => {
    setPage(toPage);
  };
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Container>
      <ProposalNavbar />

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">
                  Vote for new members to be part of the consortium
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h6">voting ends in:</Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.map((proposal: Proposal) => {
              const verifiedLevel = proposal.verifiedLevel ? (
                <Grid container direction="row" item xs={2}>
                  <CheckBox />
                  <Typography variant="body2">{`Verfied Level ${proposal.verifiedLevel}`}</Typography>
                </Grid>
              ) : null;
              const stakeLocked = proposal.stakeLocked ? (
                <Grid container direction="row" item xs={2}>
                  <CheckBox />
                  <Typography variant="body2">Stake Locked</Typography>
                </Grid>
              ) : (
                <Grid container direction="row" item xs={2}>
                  <DisabledByDefault />
                  <Typography variant="body2">Stake Locked</Typography>
                </Grid>
              );
              const end = DateTime.fromSeconds(proposal.endTime);
              const diff = end
                .diffNow()
                .shiftTo('days', 'hours', 'minutes', 'seconds')
                .toObject();
              const endsIn = `${diff.days}d ${diff.hours}h ${
                diff.minutes
              }m ${Math.floor(diff.seconds)}s`;
              return (
                <TableRow key={proposal.id} hover>
                  <TableCell key="content" sx={{ maxWidth: 600 }}>
                    <Typography>{proposal.title}</Typography>
                    <Typography noWrap={true}>
                      {proposal.description}
                    </Typography>
                    <Grid container direction="row">
                      {verifiedLevel}
                      {stakeLocked}
                    </Grid>
                  </TableCell>
                  <TableCell key="endsIn">
                    <Typography>{endsIn}</Typography>
                  </TableCell>
                  <TableCell key="action">
                    <Grid container direction="row">
                      <IconButton>
                        <CheckBox color="success" />
                      </IconButton>
                      <IconButton>
                        <DisabledByDefault color="error" />
                      </IconButton>
                    </Grid>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[10, 25, 50, 100]}
        rowsPerPage={rowsPerPage}
        page={page}
        count={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ width: '100%' }}
      />
    </Container>
  );
};

export default ProposalList;
