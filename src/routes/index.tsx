import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import Vote from '@/pages/Vote';
import { CreateProposal, ProposalList } from '@/pages/Proposals';
import ProposalDetail from '@/pages/Proposals/ProposalDetail';
import ProposalContainer from '../pages/Proposals/ProposalContainer';

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
        path: ':id',
        element: <ProposalDetail />,
      },
    ],
  },
];
const router = createBrowserRouter(routes);

export default router;
