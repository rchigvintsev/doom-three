import {Color, Object3D, Sprite} from 'three';

import {Entity} from '../entity';
import {isUpdatableMaterial} from '../../material/updatable-material';
import {TextAlign} from './text-align';

export class SpriteText extends Object3D implements Entity {
    private readonly characterCache = new Map<string, Sprite[]>();
    private readonly textCharacters: Sprite[] = [];
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

    setText(text: string) {
        this.clearText();

        let position = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            const charSprite = this.getCharacterSprite(char);
            if (charSprite) {
                charSprite.material.color.copy(this.textColor);
                charSprite.position.x = position;
                charSprite.visible = true;
                this.textCharacters.push(charSprite);
                position += charSprite.scale.x;
            }
        }

        if (this.textCharacters.length > 0) {
            this.alignText();
        }
    }

    clearText() {
        for (const char of this.textCharacters) {
            char.visible = false;
            this.characterCache.get(char.userData['character'])!.push(char);
        }
        this.textCharacters.length = 0;
    }

    setTextColor(color: number) {
        this.textColor.setHex(color);
        for (const char of this.textCharacters) {
            char.material.color.copy(this.textColor);
        }
    }

    update(deltaTime: number) {
        for (const char of this.textCharacters) {
            if (isUpdatableMaterial(char.material)) {
                char.material.update(deltaTime);
            }
        }
    }

    private getCharacterSprite(character: string): Sprite | undefined {
        const fontCharSprite = this.parameters.fontCharacters.get(character);
        if (!fontCharSprite) {
            console.error(`Character "${character}" is not defined in font "${this.parameters.fontName}"`);
            return undefined;
        }

        let charSprite;
        let cachedCharSprites = this.characterCache.get(character);
        if (cachedCharSprites == undefined) {
            this.characterCache.set(character, cachedCharSprites = []);
        }
        if (cachedCharSprites.length !== 0) {
            charSprite = cachedCharSprites.shift();
        } else {
            charSprite = fontCharSprite.clone();
            if (charSprite.geometry !== fontCharSprite.geometry) {
                charSprite.geometry = fontCharSprite.geometry.clone();
            }
            this.add(charSprite);
            console.debug(`Sprite character "${character}" is created (font "${this.parameters.fontName}")`);
        }
        return charSprite;
    }

    private alignText() {
        if (this.parameters.textAlign === TextAlign.CENTER) {
            let width = 0;
            for (const char of this.textCharacters) {
                width += char.scale.x;
            }
            for (const char of this.textCharacters) {
                char.position.x -= (width / 2 - this.textCharacters[0].scale.x / 2);
            }
        }
    }
}

export interface SpriteTextParameters {
    fontName: string,
    fontCharacters: Map<string, Sprite>;
    textAlign?: TextAlign;
    textColor?: number;
}