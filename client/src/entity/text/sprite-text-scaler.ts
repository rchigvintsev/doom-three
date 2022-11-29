import {SpriteChar} from './sprite-char';

export class SpriteTextScaler {
    constructor(private readonly fontDef: any, private readonly textDef: any) {
    }

    scale(...textChars: SpriteChar[]) {
        for (const spriteChar of textChars) {
            const charDef = this.fontDef.characters[spriteChar.char];
            spriteChar.scale.x = charDef.scale[0] * this.textDef.textScale[0] / this.textDef.scale[0];
            spriteChar.scale.y = charDef.scale[1] * this.textDef.textScale[1] / this.textDef.scale[1];
        }
    }
}