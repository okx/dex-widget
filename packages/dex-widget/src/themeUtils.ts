import { OkxSwapTheme, OkxSwapWidgetPalette } from './types';

export function isOkxSwapWidgetPalette(
    palette: OkxSwapTheme | OkxSwapWidgetPalette | undefined,
): palette is OkxSwapWidgetPalette {
    return Boolean(palette && typeof palette === 'object');
}
