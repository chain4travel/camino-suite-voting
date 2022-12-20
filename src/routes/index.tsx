import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Vote from "../pages/Vote";
import { CreateProposal, ProposalList } from "../pages/Proposals";

const router = createBrowserRouter(
  [
    {
      path: "/vote",
      element: <Vote />,
    },
    {
      path: "/vote/:category",
      element: <ProposalList />,
    },
    {
      path: "/vote/:category/create",
      element: <CreateProposal />,
    },
  ]
);

export default router;
