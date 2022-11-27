export enum TextAlign  {
    NONE = 'none', CENTER = 'center'
}

export function parseTextAlign(value?: string): TextAlign {
    if (value === TextAlign.CENTER) {
        return TextAlign.CENTER;
    }
    return TextAlign.NONE;
}
