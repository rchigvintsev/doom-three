import {Color, Object3D, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {SpriteText} from './sprite-text';
import {GameAssets} from '../../game-assets';
import {MaterialFactory} from '../../material/material-factory';
import {FontStyle, parseFontStyle} from './font-style';
import {parseTextAlign, TextAlign} from './text-align';
import {SpriteChar} from './sprite-char';
import {SpriteTextScaler} from './sprite-text-scaler';
import {MaterialStyle} from '../../material/stylable-material';

const FONT_STYLE_ITALIC_SHIFT_FACTOR = 0.35;

export class SpriteTextFactory implements EntityFactory<SpriteText> {
    private readonly fontChars = new Map<string, Map<string, SpriteChar>>();

    constructor(private readonly parameters: SpriteTextFactoryParameters) {
    }

    create(textDef: any): SpriteText {
        const fontKey = `${textDef.font}__${textDef.fontSize}__${this.getFontStyle(textDef)}`;
        let fontChars = this.fontChars.get(fontKey);
        if (!fontChars) {
            fontChars = this.createFontChars(textDef);
            this.fontChars.set(fontKey, fontChars);
        }

        const text = new SpriteText({
            fontName: textDef.font,
            fontStyle: this.getFontStyle(textDef),
            fontChars: fontChars,
            textAlign: this.getTextAlign(textDef),
            textColor: textDef.textColor,
            textStyles: this.getTextStyles(textDef),
            textOpacity: textDef.textOpacity,
            textScaler: new SpriteTextScaler(this.getFontDef(textDef), textDef)
        });
        text.name = textDef.name;
        this.setTextScale(textDef, text);
        this.setTextPosition(textDef, text);
        return text;
    }

    private createFontChars(textDef: any) {
        const fontChars = new Map<string, SpriteChar>();
        const fontDef = this.getFontDef(textDef);
        for (const ch of Object.keys(fontDef.characters)) {
            const charDef = fontDef.characters[ch];
            const materials = this.parameters.materialFactory.create(charDef.material);
            const spriteChar = new SpriteChar(ch, <SpriteMaterial>materials[0]);
            this.applyFontStyle(textDef, charDef, spriteChar);
            fontChars.set(ch, spriteChar);
        }
        return fontChars;
    }

    private getFontDef(textDef: any) {
        return this.parameters.assets.fontDefs.get(`${textDef.font}__${textDef.fontSize}`);
    }

    private applyFontStyle(textDef: any, charDef: any, char: SpriteChar) {
        if (this.getFontStyle(textDef) === FontStyle.BACK_ITALIC) {
            char.geometry = char.geometry.clone();
            const uvAttr = char.geometry.getAttribute("uv");
            const uvs = <number[]>uvAttr.array;
            const shift = FONT_STYLE_ITALIC_SHIFT_FACTOR * (textDef.textScale[1] / textDef.textScale[0])
                * (charDef.scale[1] / charDef.scale[0]);
            uvs[0] = uvs[0] + shift;
            uvs[5] = uvs[5] + shift;
            uvAttr.needsUpdate = true;
        }
    }

    private getFontStyle(textDef: any): FontStyle {
        return parseFontStyle(textDef.fontStyle);
    }

    private getTextAlign(textDef: any): TextAlign {
        return parseTextAlign(textDef.textAlign);
    }

    private getTextStyles(textDef: any): Map<string, MaterialStyle> | undefined {
        if (textDef.styles) {
            const styles = new Map<string, MaterialStyle>();
            for (const styleName of Object.keys(textDef.styles)) {
                const styleDef = textDef.styles[styleName];
                styles.set(styleName, new MaterialStyle(styleName, new Color().setHex(styleDef.color)));
            }
            return styles;
        }
        return undefined;
    }

    private setTextScale(textDef: any, sprite: Object3D) {
        if (textDef.scale) {
            sprite.scale.set(textDef.scale[0], textDef.scale[1], 1);
        }
    }

    private setTextPosition(textDef: any, sprite: Object3D) {
        if (textDef.position) {
            let x = 0, y = 0;
            if (textDef.position.right) {
                x = window.innerWidth / 2 - textDef.position.right;
            }
            if (textDef.position.bottom) {
                y = (window.innerHeight / 2 - textDef.position.bottom) * -1;
            }
            sprite.position.set(x, y, 0);
        }
    }
}

export interface SpriteTextFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    materialFactory: MaterialFactory;
}
