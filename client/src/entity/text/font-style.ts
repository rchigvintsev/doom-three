export enum FontStyle {
    NORMAL = 'normal', BACK_ITALIC = 'back-italic'
}

export function parseFontStyle(value?: string): FontStyle {
    if (value === FontStyle.BACK_ITALIC) {
        return FontStyle.BACK_ITALIC;
    }
    return FontStyle.NORMAL;
}
