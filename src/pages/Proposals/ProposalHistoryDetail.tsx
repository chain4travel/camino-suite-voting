import React, { useMemo } from 'react';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { CheckBox, DisabledByDefault } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DateTime } from 'luxon';
import randomcolor from 'randomcolor';

import { useProposal } from '@/hooks/proposals';

ChartJS.register(ArcElement, Tooltip, ChartDataLabels);

const ProposalHistoryDetail = () => {
  const { category, id } = useParams();
  const proposal = useProposal(category, id);
  const options = Object.keys(proposal.votes);
  const result = options.reduce((a, b) =>
    proposal.votes[a] > proposal.votes[b] ? a : b
  );
  const resultIcon =
    result === 'no' ? (
      <DisabledByDefault color="error" fontSize="large" />
    ) : (
      <CheckBox color="success" fontSize="large" />
    );

  const { pieData, pieOptions } = useMemo(() => {
    const data = Object.values(proposal.votes);
    const colors = data.map(() => randomcolor());
    const textAlign: 'center' | 'left' | 'right' = 'center';
    return {
      pieData: {
        labels: options,
        datasets: [
          {
            label: '# of votes',
            data,
            backgroundColor: colors.map(c => `${c}66`),
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
      pieOptions: {
        plugins: {
          datalabels: {
            formatter: (value: any, ctx: any) => {
              const labels = ctx.chart.data.labels;
              return `${value}\n${labels[ctx.dataIndex].toUpperCase()}`;
            },
            textAlign,
            font: {
              size: 14,
            },
          },
        },
      },
    };
  }, [proposal.votes]);

  return (
    <>
      <Typography variant="h6" paddingY={2} paddingX={2}>
        Vote for new members to be part of the consortium
      </Typography>
      <Grid container direction="row" alignItems="center">
        <Typography variant="h5" paddingX={2}>
          {proposal?.title}
        </Typography>
        <Grid item textAlign="center">
          {resultIcon}
          <Typography variant="body2">{result}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ marginBottom: 3, marginTop: 2 }} />
      <Typography variant="subtitle1" paddingX={2}>
        Date of execution
      </Typography>
      <Typography variant="body2" paddingX={2} paddingY={2}>
        {DateTime.fromSeconds(proposal?.executionTime).toFormat(
          'dd.MM.yyyy - hh:mm:ss a'
        )}
      </Typography>
      <Typography variant="h5" paddingX={2} paddingY={2}>
        Description
      </Typography>
      <Typography variant="body2" paddingX={2} padding={2}>
        {proposal?.description}
      </Typography>
      <Typography variant="h5" paddingX={2} paddingY={2}>
        {`Distribution of ${options.join(' / ')} votes`}
      </Typography>
      <Box width={300} height={300} marginTop={2}>
        <Pie data={pieData} options={pieOptions} />
      </Box>
    </>
  );
};

export default ProposalHistoryDetail;
