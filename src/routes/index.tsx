import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import Vote from '@/pages/Vote';
import { CreateProposal, ProposalList } from '@/pages/Proposals';
import ProposalDetail from '@/pages/Proposals/ProposalDetail';

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
    element: <ProposalList />,
  },
  {
    path: '/vote/:category/create',
    element: <CreateProposal />,
  },
  {
    path: '/vote/:category/:id',
    element: <ProposalDetail />,
  },
];
const router = createBrowserRouter(routes);

export default router;
