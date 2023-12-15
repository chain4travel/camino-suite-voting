export const toPastTense = (word?: string) => {
  if (!word) return '';
  if (word.slice(-1) === 'e') {
    return `${word}d`;
  }
  return `${word}ed`;
};

export const getTxExplorerUrl = (
  network = 'local',
  chain: string,
  txHash: string
) =>
  `${
    location.origin
  }/explorer/${network}/${chain.toLowerCase()}-chain/tx/${txHash}`;
