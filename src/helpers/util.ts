import { reduce } from 'lodash';
import { VotingOption } from '@/types';

export const countMultipleOptionsBy = (items: any, byField: string) => {
  return reduce(
    items,
    (result: any, item) => {
      item[byField].map(
        (value: string | number) => (result[value] = (result[value] ?? 0) + 1)
      );
      return result;
    },
    {}
  );
};

export const getOptionLabel = (option: VotingOption) => {
  let label = option.label;
  if (option.value === true) {
    label = 'Accept';
  } else if (option.value === false) {
    label = 'Decline';
  }
  return label;
};
