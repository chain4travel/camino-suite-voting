import { reduce } from 'lodash';

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
