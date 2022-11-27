import {Color, Object3D} from 'three';

import {Entity} from '../entity';
import {isUpdatableMaterial} from '../../material/updatable-material';
import {TextAlign} from './text-align';
import {SpriteChar} from './sprite-char';
import {FontStyle} from './font-style';

export class SpriteText extends Object3D implements Entity {
    private readonly charCache = new Map<string, SpriteChar[]>();
    private readonly textChars: SpriteChar[] = [];
    private readonly textColor = new Color(0xffffff);

    constructor(private readonly parameters: SpriteTextParameters) {
        super();
        if (this.parameters.textColor != undefined) {
            this.textColor.setHex(this.parameters.textColor);
        }
    }

    init() {
        // Do nothing
    }

    clearText() {
        for (const char of this.textChars) {
            char.visible = false;
            this.charCache.get(char.char)!.push(char);
        }
        this.textChars.length = 0;
    }

    setText(text: string) {
        this.clearText();

        let position = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const spriteChar = this.getSpriteChar(char);
            if (spriteChar) {
                spriteChar.material.color.copy(this.textColor);
                spriteChar.position.x = position;
                spriteChar.visible = true;
                this.textChars.push(spriteChar);
                position += spriteChar.scale.x;
            }
        }

        if (this.textChars.length > 0) {
            this.alignText();
        }
    }

    setTextColor(color: number) {
        this.textColor.setHex(color);
        for (const char of this.textChars) {
            char.material.color.copy(this.textColor);
        }
    }

    update(deltaTime: number) {
        for (const char of this.textChars) {
            if (isUpdatableMaterial(char.material)) {
                char.material.update(deltaTime);
            }
        }
    }

    private getSpriteChar(char: string): SpriteChar | undefined {
        const fontChar = this.parameters.fontChars.get(char);
        if (!fontChar) {
            console.error(`Character "${char}" is not defined in font "${this.parameters.fontName}"`);
            return undefined;
        }

        let spriteChar;
        let cachedChars = this.charCache.get(char);
        if (cachedChars == undefined) {
            this.charCache.set(char, cachedChars = []);
        }
        if (cachedChars.length > 0) {
            spriteChar = cachedChars.shift();
        } else {
            spriteChar = fontChar.clone(this.parameters.fontStyle !== FontStyle.NORMAL);
            this.add(spriteChar);
            console.debug(`Sprite character "${char}" is created (font "${this.parameters.fontName}")`);
        }
        return spriteChar;
    }

    private alignText() {
        if (this.parameters.textAlign === TextAlign.CENTER) {
            let width = 0;
            for (const char of this.textChars) {
                width += char.scale.x;
            }
            for (const char of this.textChars) {
                char.position.x -= (width / 2 - this.textChars[0].scale.x / 2);
            }
        }
    }
}

export interface SpriteTextParameters {
    fontName: string,
    fontStyle: FontStyle,
    fontChars: Map<string, SpriteChar>;
    textAlign: TextAlign;
    textColor?: number;
}