import {Sprite, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../../entity-factory';
import {Hud} from './hud';
import {MaterialFactory} from '../../../material/material-factory';

const SCALE_FACTOR = 2;

export class HudFactory implements EntityFactory<Hud> {
    constructor(private readonly parameters: HudFactoryParameters) {
    }

    create(hudDef: any): Hud {
        const crosshair = this.createCrosshair(hudDef);
        const ammoCounter = this.createAmmoCounter(hudDef);
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

    private createAmmoCounter(hudDef: any): Sprite[] {
        const ammoCounter = [];
        for (const spriteDef of hudDef.ammoCounter) {
            const spriteMaterials = this.parameters.materialFactory.create(spriteDef.background);
            const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
            this.setScale(spriteDef, sprite);
            this.setPosition(spriteDef, sprite);
            ammoCounter.push(sprite);
        }
        return ammoCounter;
    }

    private setScale(spriteDef: any, sprite: Sprite) {
        if (spriteDef.scale) {
            sprite.scale.set(spriteDef.scale[0] * SCALE_FACTOR, spriteDef.scale[1] * SCALE_FACTOR, 1);
        }
    }

    private setPosition(spriteDef: any, sprite: Sprite) {
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

export class HudFactoryParameters extends EntityFactoryParameters {
    materialFactory!: MaterialFactory;
}
