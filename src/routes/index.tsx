import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import Vote from '@/pages/Vote';
import {
  ProposalContainer,
  CreateProposal,
  ProposalList,
  ProposalDetail,
  ProposalHistory,
  ProposalHistoryDetail,
} from '@/pages/Proposals';

export const routes = [
  {
    path: '/',
    loader: () => redirect('/vote'),
  },
  {
    path: '/vote',
    element: <Vote />,
  },
  {
    path: '/vote/:category',
    element: <ProposalContainer />,
    children: [
      {
        path: '',
        element: <ProposalList />,
        index: true,
      },
      {
        path: 'create',
        element: <CreateProposal />,
      },
      {
        path: 'history',
        element: <ProposalHistory />,
      },
      {
        path: ':id',
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
