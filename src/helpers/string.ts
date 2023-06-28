export const toPastTense = (word?: string) => {
  if (!word) return '';
  if (word.slice(-1) === 'e') {
    return `${word}d`;
  }
  return `${word}ed`;
};
