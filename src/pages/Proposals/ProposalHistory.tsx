import React, { ChangeEvent, useState } from 'react';
import {
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
import {
  CircleOutlined,
  CheckBox,
  DisabledByDefault,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import type { Proposal, ProposalState } from '@/types';
import { useProposalHistory } from '@/hooks/proposals';
import { useProposalState } from '@/store';

const ProposalHistoyr = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const { category } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { proposals, totalCount } = useProposalHistory(
    category,
    page,
    rowsPerPage
  );
  const setCurrentProposal = useProposalState(
    (state: ProposalState) => state.setCurrentProposal
  );

  const handleChangePage = (event: unknown, toPage: number) => {
    setPage(toPage);
  };
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <Typography variant="h6">
                  {t('proposals.history.title_previous_votes')}
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.map((proposal: Proposal) => {
              const time = DateTime.fromSeconds(proposal.endTime).toFormat(
                'dd.MM.yyyy hh:mm:ss a'
              );
              const result = Object.keys(proposal.votes).reduce((a, b) =>
                proposal.votes[a] > proposal.votes[b] ? a : b
              );
              const resultIcon =
                result === 'no' ? (
                  <DisabledByDefault color="error" fontSize="large" />
                ) : (
                  <CheckBox color="success" fontSize="large" />
                );
              return (
                <TableRow
                  key={proposal.id}
                  hover
                  onClick={() => {
                    setCurrentProposal(proposal);
                    navigate(`/vote/${category}/history/${proposal.id}`);
                  }}
                >
                  <TableCell key="time" width={100}>
                    <Typography variant="subtitle2">{time}</Typography>
                  </TableCell>
                  <TableCell key="content" sx={{ maxWidth: 680 }}>
                    <Typography>{proposal.title}</Typography>
                    <Typography
                      color="text.secondary"
                      noWrap={true}
                      paddingY={1}
                    >
                      {proposal.description}
                    </Typography>
                    <Grid container direction="row" alignItems="center">
                      <CircleOutlined />
                      <Typography variant="subtitle2" marginLeft={1}>
                        {proposal.status}
                      </Typography>
                    </Grid>
                  </TableCell>
                  <TableCell key="action" align="center">
                    <IconButton sx={{ paddingBottom: 0 }}>
                      {resultIcon}
                    </IconButton>
                    <Typography>{result}</Typography>
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
    </>
  );
};

export default ProposalHistoyr;
