import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';

import ActiveVotings from '@/pages/proposal/active';
import CreateProposal from '@/pages/proposal/create';
import CompletedVotes from '@/pages/proposal/completed';
import Layout from '@/components/Layout';
import { votingTypeLoader } from './loaders';
import Detail from '@/pages/proposal/detail';
import UpcomingVotings from '@/pages/proposal/upcoming';
import CreatingProposals from '@/pages/proposal/creating';

export const getRoutes = (
  queryClient: QueryClient,
  isFeatureEnabled: (key: string) => Promise<boolean>
) => {
  const routes = [
    {
      path: '/',
      loader: () => redirect('/dac'),
    },
    {
      path: '/dac',
      element: <Layout />,
      children: [
        {
          path: 'create',
          element: <CreateProposal />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'active',
          element: <ActiveVotings />,
          index: true,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'active/:type/:id',
          element: <Detail />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'creating',
          element: <CreatingProposals />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'upcoming',
          element: <UpcomingVotings />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'upcoming/:type/:id',
          element: <Detail />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'completed',
          element: <CompletedVotes />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
        {
          path: 'completed/:type/:id',
          element: <Detail />,
          loader: votingTypeLoader(queryClient, isFeatureEnabled),
        },
      ],
    },
  ];
  return createBrowserRouter(routes);
};
