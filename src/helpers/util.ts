import { reduce } from 'lodash';
import { VotingOption } from '@/types';
import sanitizeHtml from 'sanitize-html';

export const fractionDenominator = 1000000;
export const THIRTY_DAYS_IN_SECONDS = 2592000;
export const SIXTY_DAYS_IN_SECONDS = 5184000;

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

export const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape' as sanitizeHtml.DisallowedTagsModes,
  allowedSchemes: [],
  allowProtocolRelative: false,
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
