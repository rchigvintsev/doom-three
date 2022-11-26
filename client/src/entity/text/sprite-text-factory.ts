import {Object3D, Sprite, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {SpriteText} from './sprite-text';
import {GameAssets} from '../../game-assets';
import {MaterialFactory} from '../../material/material-factory';
import {TextStyle} from './text-style';
import {TextAlign} from './text-align';

const TEXT_STYLE_ITALIC_SHIFT_FACTOR = 0.3;

export class SpriteTextFactory implements EntityFactory<SpriteText> {
    constructor(private readonly parameters: SpriteTextFactoryParameters) {
    }

    create(textDef: any): SpriteText {
        const fontDef = this.parameters.assets.fontDefs.get(textDef.font);

        const charSprites = new Map<string, Sprite>();
        for (const char of Object.keys(fontDef.characters)) {
            const charDef = fontDef.characters[char];
            const charMaterial = this.parameters.materialFactory.create(charDef.material);
            const charSprite = new Sprite(<SpriteMaterial>charMaterial[0]);
            charSprite.userData['character'] = char;
            charSprite.scale.x = charDef.scale[0] * textDef.textScale[0] / textDef.scale[0];
            charSprite.scale.y = charDef.scale[1] * textDef.textScale[1] / textDef.scale[1];
            this.applyTextStyle(textDef, charDef, charSprite);
            charSprite.visible = false;
            charSprites.set(char, charSprite);
        }

        const text = new SpriteText({
            fontName: textDef.font,
            fontCharacters: charSprites,
            textAlign: this.getTextAlign(textDef),
            textColor: textDef.textColor
        });
        this.setScale(textDef, text);
        this.setPosition(textDef, text);
        return text;
    }

    private applyTextStyle(textDef: any, charDef: any, character: Sprite) {
        if (textDef.textStyle === TextStyle.BACK_ITALIC) {
            character.geometry = character.geometry.clone();
            const uvAttr = character.geometry.getAttribute("uv");
            const uvs = <number[]>uvAttr.array;
            uvs[0] = uvs[0] + TEXT_STYLE_ITALIC_SHIFT_FACTOR * (charDef.scale[1] / charDef.scale[0]);
            uvs[5] = uvs[5] + TEXT_STYLE_ITALIC_SHIFT_FACTOR * (charDef.scale[1] / charDef.scale[0]);
            uvAttr.needsUpdate = true;
        }
    }

    private getTextAlign(textDef: any): TextAlign | undefined {
        return textDef.textAlign === 'center' ? TextAlign.CENTER : undefined;
    }

    private setScale(textDef: any, sprite: Object3D) {
        if (textDef.scale) {
            sprite.scale.set(textDef.scale[0], textDef.scale[1], 1);
        }
    }

    private setPosition(textDef: any, sprite: Object3D) {
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
