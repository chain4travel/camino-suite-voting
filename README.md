# camino-suite-voting

DAC (Decentralized Autonomous Consortium) Voting System

### Get Started

#### Prerequisites

- camino-suite
  - depends on
    - camino-wallet
    - camino-block-explorer
- caminojs (`addDACTx` branch)

#### Run on local machine

- Modify (refer to the PR [#180](https://github.com/chain4travel/camino-suite/pull/180)) and start the `camino-suite`, and start the apps it depends on, i.e.,
  - Start the `camino-wallet`
  - Start the `camino-block-explorer`
- Update the submodule from remote
  - `git submodule update --init --remote`
  - enter into the submodule folder `caminojs` and check if locates at commit `ad7f3a7f`
  - install the dependencies and build `caminojs`, `yarn && yarn build`
  - and check the `dist` folder has been created under then `caminojs`
  - \*\* if the dac TXs implementation have been merged and released into `caminojs`, we don't need the submodule, just install `caminojs` into the dependency as so far
- Install the dependencies
  - `pnpm i` or use `yarn`
- Start the voting app
  - `pnpm start` or `yarn start`

## TODO

### Before deployment

- **Theme**: `light` mode has not been fully tested
- **Dockerfile**: need to be created
- **camino-suite**: merge or modify the PR [#185](https://github.com/chain4travel/camino-suite/pull/185) to add DAC app
- **camino-suite-voting (this repo)**: make sure the included submodule `caminojs` referencing to the `addDACTx` branch of `caminojs`

## For the future development of new proposal type

- Implement the new proposal type in `caminojs`([addDACTx](https://github.com/chain4travel/caminojs/tree/addDACTx) branch), can reference to the
  - `src/apis/platformvm/addproposaltx/addmemberproposal.ts` to extends the abstract class, `EssentialProposal`, and implement the necessary methods
  - `src/apis/platformvm/constants.ts` to add the ID of the new proposal type
- Most of UI components have a draft according to the previous design in Figma, like General Proposal and Fee Distribution, can check under the folders, `pages/proposal/active`, `pages/proposal/completed`, and `pages/proposal/create`
- Add or modify the configuration to enable the proposal type in `routes/loaders.tsx` according to the value of `ProposalTypes` enum
- Update the `useAddProposal` hook in the `src/hooks/useProposals.ts` to add the new proposal type ID (sync with backend) with the extra parameters according to the caminojs API
