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

export function displayFirstPartLongString(
  val: string,
  maxLength = 12
): string {
  if (!val) {
    return '';
  }
  if (val.length > maxLength) {
    const partSize = (maxLength - 1) / 2;
    const remainder = (maxLength - 1) % 2;
    const firstPartSize = partSize + remainder;
    return val.substring(0, firstPartSize);
  } else {
    return val;
  }
}

export function displaySecondPartLongString(
  val: string,
  maxLength = 12
): string {
  if (!val) {
    return '';
  }
  if (val.length > maxLength) {
    const partSize = (maxLength - 1) / 2;
    return val.substring(val.length + 1 - partSize, val.length);
  } else {
    return val;
  }
}
