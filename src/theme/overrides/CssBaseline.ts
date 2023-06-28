const CssBaselineOverrides = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        width: '100%',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      },
      body: {
        width: '100%',
        height: '100%',
      },
      '#app': {
        width: '100%',
        height: '100%',
      },
    },
  },
};
export default CssBaselineOverrides;
