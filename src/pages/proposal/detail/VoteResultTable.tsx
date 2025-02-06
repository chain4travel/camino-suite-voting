import React, { forwardRef } from 'react';
import { AccountBalanceWalletOutlined } from '@mui/icons-material';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { VoteData } from '@/types';
import Paper from '@/components/Paper';

const TablePaper = styled(Paper)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
}));

type ColumnField = {
  dataKey: 'address' | 'votedDateTime' | 'option';
  label: string;
  width: string | number;
};
const columns: ColumnField[] = [
  { dataKey: 'address', label: 'Address / Name', width: '100%' },
  { dataKey: 'votedDateTime', label: 'Time of vote', width: 220 },
  { dataKey: 'option', label: 'Voted for', width: 100 },
];

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
  votes?: VoteData[];
}
const VoteResultTable = ({ votes }: VoteResultTableProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <TablePaper sx={{ width: '100%', height: 400 }}>
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
                  background: isDark
                    ? '#0F182A'
                    : `${theme.palette.background.default} !important`,
                  backgroundColor: 'grey.900',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {idx === 0 && <Box width={24} height={24} />}
                  <Typography variant="caption">{column.label}</Typography>
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
                  sx={{
                    borderColor: 'divider',
                    color: row.votedDateTime === '-' ? '#999090' : 'inherit',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {idx === 0 && (
                      <AccountBalanceWalletOutlined
                        sx={{
                          color: 'text.primary',
                        }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row[column.dataKey]}
                    </Typography>
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
