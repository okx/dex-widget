import { PaletteMode } from '@mui/material';
import { PaletteOptions } from '@mui/material/styles';

export const darkPalette: PaletteOptions = {
    mode: 'dark' as PaletteMode,
    tonalOffset: 0.2,
    primary: {
        main: 'rgb(202, 233, 255)',
    },
    secondary: {
        main: 'rgb(39, 120, 242)',
    },
    text: {
        primary: '#fff',
        secondary: '#e6e6e6',
        disabled: '#5b5b5b',
    },
    background: {
        paper: '#121212',
        default: '#000000',
    },
};

export const lightPalette: PaletteOptions = {
    mode: 'light' as PaletteMode,
    tonalOffset: 0.5,
    primary: {
        main: '#272727',
    },
    secondary: {
        main: 'rgb(39, 120, 242)',
    },
    text: {
        primary: '#000',
        secondary: '#383838',
        disabled: '#b3b3b3',
    },
    background: {
        default: '#e6e6e6',
        paper: '#ffffff',
    },
};
