import {Object3D, Sprite, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../../entity-factory';
import {AmmoCounter, Hud} from './hud';
import {MaterialFactory} from '../../../material/material-factory';
import {GameAssets} from '../../../game-assets';
import {SpriteTextFactory} from '../../text/sprite-text-factory';
import {SpriteText} from '../../text/sprite-text';
import {Player} from '../player';

const SCALE_FACTOR = 2;

export class HudFactory implements EntityFactory<Hud> {
    constructor(private readonly parameters: HudFactoryParameters) {
    }

    create(hudDef: any): Hud {
        const crosshair = this.createCrosshair(hudDef);
        const ammoCounter = this.createAmmoCounter(hudDef);
        const weaponIndicator = this.createWeaponIndicator(hudDef);
        const hud = new Hud({
            config: this.parameters.config,
            player: this.parameters.player,
            crosshair,
            ammoCounter,
            weaponIndicator
        });
        hud.init();
        return hud;
    }

    private createCrosshair(hudDef: any): Sprite[] {
        const crosshair = [];
        for (const spriteDef of hudDef.crosshair) {
            const spriteMaterials = this.parameters.materialFactory.create(spriteDef.material);
            const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
            this.setScale(spriteDef, sprite);
            crosshair.push(sprite);
        }
        return crosshair;
    }

    private createAmmoCounter(hudDef: any): AmmoCounter {
        const background: Sprite[] = [];
        for (const spriteDef of hudDef.ammoCounter.background) {
            const spriteMaterials = this.parameters.materialFactory.create(spriteDef.material);
            const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
            this.setScale(spriteDef, sprite);
            this.setPosition(spriteDef, sprite);
            background.push(sprite);
        }

        const ammoText: SpriteText[] = [];
        for (const textDef of hudDef.ammoCounter.ammoText) {
            const spriteText = this.parameters.spriteTextFactory.create(textDef);
            spriteText.scale.multiplyScalar(SCALE_FACTOR);
            ammoText.push(spriteText);
        }

        const ammoReserveText: SpriteText[] = [];
        for (const textDef of hudDef.ammoCounter.ammoReserveText) {
            const spriteText = this.parameters.spriteTextFactory.create(textDef);
            spriteText.scale.multiplyScalar(SCALE_FACTOR);
            ammoReserveText.push(spriteText);
        }

        const counter = new AmmoCounter(background, ammoText, ammoReserveText);
        counter.setAmmo(0);
        counter.setAmmoReserve(0);
        return counter;
    }

    private createWeaponIndicator(hudDef: any): Sprite[] {
        const weaponIndicator = [];
        for (const spriteDef of hudDef.weaponIndicator) {
            const spriteMaterials = this.parameters.materialFactory.create(spriteDef.material);
            const sprite = new Sprite(<SpriteMaterial>spriteMaterials[0]);
            this.setScale(spriteDef, sprite);
            this.setPosition(spriteDef, sprite);
            weaponIndicator.push(sprite);
        }
        return weaponIndicator;
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
    player: Player;
    materialFactory: MaterialFactory;
    spriteTextFactory: SpriteTextFactory;
}
