import React from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';

import Vote from '../pages/Vote';
import { CreateProposal, ProposalList } from '../pages/Proposals';

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
];
const router = createBrowserRouter(routes);

export default router;
