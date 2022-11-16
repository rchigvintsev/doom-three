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
        return new Hud({config: this.parameters.config, crosshair});
    }

    private createCrosshair(hudDef: any): Sprite[] {
        const crosshair = [];
        for (const child of hudDef.crosshair.children) {
            const childMaterials = this.parameters.materialFactory.create(child.background);
            const childSprite = new Sprite(<SpriteMaterial>childMaterials[0]);
            childSprite.scale.set(child.scale[0] * SCALE_FACTOR, child.scale[1] * SCALE_FACTOR, 1);
            crosshair.push(childSprite);
        }
        return crosshair;
    }
}

export class HudFactoryParameters extends EntityFactoryParameters {
    materialFactory!: MaterialFactory;
}
