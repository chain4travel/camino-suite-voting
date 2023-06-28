import { Vote } from '@/types';
import { Circle } from '@mui/icons-material';
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
} from '@mui/material';
import React, { forwardRef } from 'react';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';

const TablePaper = styled(Paper)(({ theme }) => ({
  boxShadow: 'none',
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

type ColumnField = {
  dataKey: 'address' | 'votedDateTime' | 'option';
  label: string;
  width: string | number;
};
const columns: ColumnField[] = [
  { dataKey: 'address', label: 'ADDRESS / NAME', width: '100%' },
  { dataKey: 'votedDateTime', label: 'TIME OF VOTE', width: 260 },
  { dataKey: 'option', label: 'VOTE FOR', width: 260 },
];

interface VoteData extends Vote {
  id: number;
}
const VirtuosoTableComponents: TableComponents<VoteData> = {
  Scroller: forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={TablePaper} {...props} ref={ref} />
  )),
  Table: props => (
    <Table
      {...props}
      sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
    />
  ),
  TableHead,
  TableRow: props => <TableRow {...props} />,
  TableBody: forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};
interface VoteResultTableProps {
  votes: VoteData[];
}
const VoteResultTable = ({ votes }: VoteResultTableProps) => {
  return (
    <TablePaper sx={{ height: 400, width: '100%' }}>
      <TableVirtuoso
        data={votes}
        components={VirtuosoTableComponents}
        fixedHeaderContent={() => (
          <TableRow>
            {columns.map((column, idx) => (
              <TableCell
                key={column.dataKey}
                variant="head"
                align="left"
                style={{ width: column.width }}
                sx={{
                  backgroundColor: 'grey.800',
                  borderColor: 'divider',
                  color: 'grey.500',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {idx === 0 ? <Circle /> : null}
                  <Typography>{column.label}</Typography>
                </Stack>
              </TableCell>
            ))}
          </TableRow>
        )}
        itemContent={(_index: number, row: VoteData) => {
          return (
            <>
              {columns.map((column, idx) => (
                <TableCell
                  key={column.dataKey}
                  align="left"
                  sx={{ borderColor: 'divider' }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {idx === 0 ? (
                      <svg height={24} width={24}>
                        <defs>
                          <linearGradient
                            id="grad"
                            gradientTransform="rotate(45)"
                          >
                            <stop offset="40%" stopColor="#35E9AD" />
                            <stop offset="120%" stopColor="#149EED" />
                          </linearGradient>
                        </defs>
                        <circle cx={12} cy={12} r="10" fill="url(#grad)" />
                      </svg>
                    ) : null}
                    <Typography>{row[column.dataKey]}</Typography>
                  </Stack>
                </TableCell>
              ))}
            </>
          );
        }}
      />
    </TablePaper>
  );
};
export default VoteResultTable;
