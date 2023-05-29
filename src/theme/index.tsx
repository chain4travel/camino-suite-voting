import React from 'react';
import { ThemeOptions, createTheme } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import shadows from './shadows';
import overrides from './overrides';
import { PaletteMode } from '@mui/material';

type CaminoThemes = {
  light: ThemeOptions;
  dark: ThemeOptions;
};
export default class CaminoTheme {
  private static _commonThemeOptions = {
    components: overrides,
    shape: { borderRadius: 12 },
    typography,
    breakpoints,
  };
  private static _themes: CaminoThemes = {
    light: {
      ...this._commonThemeOptions,
      palette: { ...palette.light, mode: 'light' },
      shadows: shadows.light,
    },
    dark: {
      ...this._commonThemeOptions,
      palette: { ...palette.dark, mode: 'dark' },
      shadows: shadows.dark,
    },
  };
  private static _muiThemes = {
    light: createTheme(this._themes.light),
    dark: createTheme(this._themes.dark),
  };

  static getThemeOptions(mode: PaletteMode | undefined) {
    return this._themes[mode ?? 'light'];
  }

  static getMuiTheme(mode: PaletteMode | undefined) {
    return this._muiThemes[mode ?? 'light'];
  }
}
