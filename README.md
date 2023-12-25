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
