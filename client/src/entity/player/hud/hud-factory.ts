import {Object3D, Sprite, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../../entity-factory';
import {AmmoCounter, Hud} from './hud';
import {MaterialFactory} from '../../../material/material-factory';
import {GameAssets} from '../../../game-assets';
import {SpriteTextFactory} from '../../text/sprite-text-factory';
import {SpriteText} from '../../text/sprite-text';

const SCALE_FACTOR = 2;

export class HudFactory implements EntityFactory<Hud> {
    constructor(private readonly parameters: HudFactoryParameters) {
    }

    create(hudDef: any): Hud {
        const crosshair = this.createCrosshair(hudDef);
        const ammoCounter = this.createAmmoCounter(hudDef);
        ammoCounter.setValue(0);
        return new Hud({config: this.parameters.config, crosshair, ammoCounter});
    }

    private createCrosshair(hudDef: any): Sprite[] {
        const crosshair = [];
        for (const spriteDef of hudDef.crosshair) {
            const spriteMaterials = this.parameters.materialFactory.create(spriteDef.background);
            const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
            this.setScale(spriteDef, sprite);
            crosshair.push(sprite);
        }
        return crosshair;
    }

    private createAmmoCounter(hudDef: any): AmmoCounter {
        const background: Sprite[] = [];
        let text: SpriteText;
        for (const spriteDef of hudDef.ammoCounter) {
            if (spriteDef.font) {
                text = this.parameters.spriteTextFactory.create(spriteDef);
                text.scale.multiplyScalar(SCALE_FACTOR);
            } else {
                const spriteMaterials = this.parameters.materialFactory.create(spriteDef.background);
                const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
                this.setScale(spriteDef, sprite);
                this.setPosition(spriteDef, sprite);
                background.push(sprite);
            }
        }
        return new AmmoCounter(background, text!);
    }

    private setScale(spriteDef: any, sprite: Object3D) {
        if (spriteDef.scale) {
            sprite.scale.set(spriteDef.scale[0] * SCALE_FACTOR, spriteDef.scale[1] * SCALE_FACTOR, 1);
        }
    }

    private setPosition(spriteDef: any, sprite: Object3D) {
        if (spriteDef.position) {
            let x = 0, y = 0;
            if (spriteDef.position.right) {
                x = window.innerWidth / 2 - spriteDef.position.right;
            }
            if (spriteDef.position.bottom) {
                y = (window.innerHeight / 2 - spriteDef.position.bottom) * -1;
            }
            sprite.position.set(x, y, 0);
        }
    }
}

export interface HudFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    materialFactory: MaterialFactory;
    spriteTextFactory: SpriteTextFactory;
}
