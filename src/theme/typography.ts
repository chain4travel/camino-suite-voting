const pxToRem = (value: number) => `${value / 16}rem`;

const responsiveFontSizes = ({
  sm,
  md,
  lg,
}: {
  sm: number;
  md?: number;
  lg?: number;
}) => ({
  '@media (min-width:600px)': {
    fontSize: pxToRem(sm),
  },
  '@media (min-width:900px)': {
    fontSize: pxToRem(md ?? sm),
  },
  '@media (min-width:1200px)': {
    fontSize: pxToRem(lg ?? md ?? sm),
  },
});

const FONT_PRIMARY = 'Inter';
const FONT_SECONDARY = 'Inter';

const typography = {
  fontFamily: FONT_PRIMARY,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  h1: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 80 / 64,
    fontSize: pxToRem(40),
    ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
  },
  h2: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 64 / 48,
    fontSize: pxToRem(32),
    ...responsiveFontSizes({ sm: 32, md: 36, lg: 40 }),
  },
  h3: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
  },
  h4: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ sm: 20, md: 24 }),
  },
  h5: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 19, md: 20 }),
  },
  h6: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 28 / 18,
    fontSize: pxToRem(17),
    ...responsiveFontSizes({ sm: 18 }),
  },
  subtitle1: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  subtitle2: {
    fontFamily: FONT_PRIMARY,
    fontWeight: 500,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  body1: {
    fontFamily: FONT_SECONDARY,
    lineHeight: 1.5,
    fontWeight: 400,
    fontSize: pxToRem(16),
  },
  body2: {
    fontFamily: FONT_SECONDARY,
    lineHeight: 22 / 14,
    fontWeight: 400,
    fontSize: pxToRem(14),
  },
  caption: {
    fontFamily: FONT_SECONDARY,
    lineHeight: 1.5,
    fontWeight: 500,
    fontSize: pxToRem(12),
  },
  overline: {
    fontFamily: FONT_SECONDARY,
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: FONT_SECONDARY,
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(14),
    textTransform: 'capitalize',
  },
} as const;

export default typography;
