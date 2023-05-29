import { alpha } from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
  interface ColorTypes {
    primary: string;
  }
  interface Palette {
    logo: ColorTypes;
  }
  interface TypeBackground {
    secondary: string;
  }
}

const GREY = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

const ACTION = {
  hover: alpha('#919EAB', 0.12),
  selected: alpha('#919EAB', 0.16),
  disabled: GREY[600],
  disabledBackground: GREY[800],
  focus: alpha('#919EAB', 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const PRIMARY = '#0085FF';
const SKY = '#B5E3FD';
const ACCENT = '#35E9AD';

const COMMON = {
  common: { black: '#000', white: '#fff' },
  primary: { main: '#0085FF', contrastText: '#fff' },
  secondary: { main: '#B440FC', contrastText: '#fff' },
  info: { light: SKY, main: '#66C9E8', contrastText: '#fff' },
  success: { light: '#4ADE80', main: '#59B755', contrastText: GREY[800] },
  warning: { main: '#EAC254', contrastText: GREY[800] },
  error: { light: '#FCA5A5', main: '#CD3919', contrastText: '#fff' },
  grey: GREY,
  divider: GREY[700],
};

const palette = {
  light: {
    ...COMMON,
    text: { primary: GREY[800], secondary: GREY[600], disabled: GREY[500] },
    background: {
      paper: '#fff',
      default: GREY[200],
      neutral: GREY[200],
      secondary: '#fff',
    },
    action: { ...ACTION, active: GREY[600] },
    button: { primary: GREY[200], secondary: GREY[100] },
    logo: { primary: PRIMARY },
  },
  dark: {
    ...COMMON,
    text: { primary: '#fff', secondary: GREY[300], disabled: GREY[500] },
    background: {
      paper: GREY[900],
      default: GREY[900],
      neutral: GREY[500],
      secondary: GREY[800],
    },
    action: { ...ACTION, active: GREY[500] },
    button: { primary: GREY[700], secondary: GREY[800] },
    logo: { primary: PRIMARY },
  },
};

export default palette;
