import { OkSwapTheme, OkSwapWidgetPalette } from './types';

export function isOkSwapWidgetPalette(
    palette: OkSwapTheme | OkSwapWidgetPalette | undefined,
): palette is OkSwapWidgetPalette {
    return Boolean(palette && typeof palette === 'object');
}
