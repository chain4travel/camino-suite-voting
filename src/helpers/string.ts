export const toPastTense = (word?: string) => {
  if (!word) return '';
  if (word.slice(-1) === 'e') {
    return `${word}d`;
  }
  return `${word}ed`;
};

export const getTxExplorerUrl = (
  network: string,
  chain: string,
  txHash: string
) =>
  `${
    location.host
  }/explorer/${network}/${chain.toLowerCase()}-chain/tx/${txHash}`;
