import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { QueryClient } from 'react-query';

import ActiveVotings from '@/pages/proposal/active';
import CreateProposal from '@/pages/proposal/create';
import CompletedVotes from '@/pages/proposal/completed';
import Layout from '@/components/Layout';
import { votingTypeLoader } from './loaders';

export const getRoutes = (queryClient: QueryClient) => {
  const routes = [
    {
      path: '/',
      loader: () => redirect('/proposal/active'),
    },
    {
      path: '/proposal',
      element: <Layout />,
      children: [
        {
          path: 'create',
          element: <CreateProposal />,
          loader: votingTypeLoader(queryClient),
        },
        {
          path: 'active',
          element: <ActiveVotings />,
          index: true,
          loader: votingTypeLoader(queryClient),
        },
        {
          path: 'completed',
          element: <CompletedVotes />,
          loader: votingTypeLoader(queryClient),
        },
        // {
        //   path: 'active/:id',
        //   element: <ProposalDetail />,
        // },
        // {
        //   path: 'history/:id',
        //   element: <ProposalHistoryDetail />,
        // },
      ],
    },
  ];
  return createBrowserRouter(routes);
};
