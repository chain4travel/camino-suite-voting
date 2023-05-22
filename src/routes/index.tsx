import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import ActiveVotings from '@/pages/vote/active';
import CreateProposal from '@/pages/vote/create';
import {
  ProposalDetail,
  ProposalHistory,
  ProposalHistoryDetail,
} from '@/pages/Proposals';
import Layout from '@/components/Layout';
import { get } from '../helpers/http';

export const routes = [
  {
    path: '/',
    loader: () => redirect('/vote/active'),
  },
  {
    path: '/vote',
    element: <Layout />,
    children: [
      {
        path: 'create',
        element: <CreateProposal />,
      },
      {
        path: 'active',
        element: <ActiveVotings />,
        index: true,
        loader: async () => {
          return get('voting_types.json');
        },
      },
      {
        path: 'completed',
        element: <ProposalHistory />,
      },
      {
        path: 'active/:id',
        element: <ProposalDetail />,
      },
      {
        path: 'history/:id',
        element: <ProposalHistoryDetail />,
      },
    ],
  },
];
const router = createBrowserRouter(routes);

export default router;
