import {Color, Object3D} from 'three';

import {GameEntity} from '../game-entity';
import {isUpdatableMaterial} from '../../material/updatable-material';
import {TextAlign} from './text-align';
import {SpriteChar} from './sprite-char';
import {FontStyle} from './font-style';
import {SpriteTextScaler} from './sprite-text-scaler';
import {isStylableMaterial, MaterialStyle} from '../../material/stylable-material';
import {ScreenPosition} from '../../util/screen-position';

export class SpriteText extends Object3D implements GameEntity {
    private readonly textChars: SpriteChar[] = [];
    private readonly charCache = new Map<string, SpriteChar[]>();
    private readonly textColor = new Color(0xffffff);

    private _text?: string;

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

    get text(): string | undefined {
        return this._text;
    }

    set text(text: string | undefined) {
        if (this._text !== text) {
            this._text = text;
            this.clearText();

            if (text) {
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
        }
    }

    setTextColor(color: number) {
        this.textColor.setHex(color);
        for (const char of this.textChars) {
            char.material.color.copy(this.textColor);
        }
    }

    update(deltaTime: number) {
        if (this.visible) {
            for (const char of this.textChars) {
                if (isUpdatableMaterial(char.material)) {
                    char.material.update(deltaTime);
                }
            }
        }
    }

    updatePosition() {
        const screenPosition = this.parameters.screenPosition;
        let x = 0, y = 0;
        if (screenPosition.right) {
            x = window.innerWidth / 2 - screenPosition.right;
        }
        if (screenPosition.bottom) {
            y = (window.innerHeight / 2 - screenPosition.bottom) * -1;
        }
        this.position.set(x, y, 0);
    }

    applyStyle(styleName: string) {
        if (this.parameters.textStyles) {
            const style = this.parameters.textStyles.get(styleName);
            if (style) {
                for (const char of this.textChars) {
                    if (isStylableMaterial(char.material)) {
                        char.material.applyStyle(style);
                    }
                }
                this.textColor.copy(style.color);
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
            this.setCharOpacity(spriteChar);
            this.parameters.textScaler.scale(spriteChar);
            this.add(spriteChar);
            console.debug(`Sprite character "${char}" is created (font "${this.parameters.fontName}")`);
        }
        return spriteChar;
    }

    private setCharOpacity(char: SpriteChar) {
        if (this.parameters.textOpacity != undefined) {
            char.material.transparent = true;
            char.material.opacity = this.parameters.textOpacity;
        }
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
    screenPosition: ScreenPosition;
    fontName: string,
    fontStyle: FontStyle,
    fontChars: Map<string, SpriteChar>;
    textAlign: TextAlign;
    textColor?: number;
    textStyles?: Map<string, MaterialStyle>;
    textOpacity?: number;
    textScaler: SpriteTextScaler;
}