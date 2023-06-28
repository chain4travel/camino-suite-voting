import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';

import ActiveVotings from '@/pages/proposal/active';
import CreateProposal from '@/pages/proposal/create';
import CompletedVotes from '@/pages/proposal/completed';
import Layout from '@/components/Layout';
import { votingTypeLoader } from './loaders';
import Detail from '@/pages/proposal/detail';

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
        {
          path: ':type/:id',
          element: <Detail />,
          loader: votingTypeLoader(queryClient),
        },
      ],
    },
  ];
  return createBrowserRouter(routes);
};
