import moment from 'moment';

export function currentDateFormat() {
  return new Intl.DateTimeFormat(navigator.language, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
    .formatToParts()
    .map(part => {
      if (part.type === 'literal') {
        return part.value;
      }
      switch (part.type) {
        case 'day':
          return 'dd';
        case 'month':
          return 'MM';
        case 'year':
          return 'yyyy';
        default:
          return '';
      }
    })
    .join('');
}

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%d sec',
    m: '1 min',
    mm: '%d mins',
    h: '1 hr',
    hh: '%d hrs',
    d: '1 day',
    dd: '%d days',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
});

export default moment;
