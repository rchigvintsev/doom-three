import {Color, Sprite, SpriteMaterial} from 'three';

import {EntityFactory, EntityFactoryParameters} from '../entity-factory';
import {AmmoIndicator, Hud} from './hud';
import {MaterialFactory} from '../../material/material-factory';
import {GameAssets} from '../../game-assets';
import {SpriteTextFactory} from '../text/sprite-text-factory';
import {SpriteText} from '../text/sprite-text';
import {Player} from '../player/player';
import {MaterialStyle} from '../../material/stylable-material';
import {StylableSprite} from '../../sprite/stylable-sprite';

const SCALE_FACTOR = 2;

export class HudFactory implements EntityFactory<Hud> {
    constructor(private readonly parameters: HudFactoryParameters) {
    }

    create(hudDef: any): Hud {
        const crosshair = this.createCrosshair(hudDef);
        const ammoIndicator = this.createAmmoIndicator(hudDef);
        const weaponIndicator = this.createWeaponIndicator(hudDef);
        const hud = new Hud({
            config: this.parameters.config,
            player: this.parameters.player,
            crosshair,
            ammoIndicator,
            weaponIndicator
        });
        hud.init();
        return hud;
    }

    private createCrosshair(hudDef: any): StylableSprite[] {
        const crosshair = [];
        for (const spriteDef of hudDef.crosshair) {
            crosshair.push(this.createSprite(spriteDef));
        }
        return crosshair;
    }

    private createAmmoIndicator(hudDef: any): AmmoIndicator {
        const background: StylableSprite[] = [];
        for (const spriteDef of hudDef.ammoIndicator.background) {
            background.push(this.createSprite(spriteDef));
        }

        const ammoClipText: SpriteText[] = [];
        for (const textDef of hudDef.ammoIndicator.ammoClipText) {
            ammoClipText.push(this.createSpriteText(textDef));
        }

        const ammoReserveText: SpriteText[] = [];
        for (const textDef of hudDef.ammoIndicator.ammoReserveText) {
            ammoReserveText.push(this.createSpriteText(textDef));
        }

        const indicator = new AmmoIndicator(background, ammoClipText, ammoReserveText);
        indicator.setAmmo(0);
        indicator.setAmmoReserve(0);
        return indicator;
    }

    private createWeaponIndicator(hudDef: any): StylableSprite[] {
        const weaponIndicator = [];
        for (const spriteDef of hudDef.weaponIndicator) {
            weaponIndicator.push(this.createSprite(spriteDef));
        }
        return weaponIndicator;
    }

    private createSprite(spriteDef: any): StylableSprite {
        const spriteMaterials = this.parameters.materialFactory.create(spriteDef.material || spriteDef.name);
        const material = <SpriteMaterial>spriteMaterials[0];
        const sprite = new StylableSprite(material, this.getStyles(spriteDef), spriteDef.visibleOnStyle);
        sprite.name = spriteDef.name;
        this.setScale(spriteDef, sprite);
        this.setVisibility(spriteDef, sprite);
        this.setPosition(spriteDef, sprite);
        return sprite;
    }

    private createSpriteText(textDef: any) {
        const spriteText = this.parameters.spriteTextFactory.create(textDef);
        spriteText.scale.multiplyScalar(SCALE_FACTOR);
        return spriteText;
    }

    private getStyles(spriteDef: any): Map<string, MaterialStyle> | undefined {
        if (spriteDef.styles) {
            const styles = new Map<string, MaterialStyle>();
            for (const styleName of Object.keys(spriteDef.styles)) {
                const styleDef = spriteDef.styles[styleName];
                styles.set(styleName, new MaterialStyle(styleName, new Color().setHex(styleDef.color)));
            }
            return styles;
        }
        return undefined;
    }

    private setScale(spriteDef: any, sprite: Sprite) {
        if (spriteDef.scale) {
            sprite.scale.set(spriteDef.scale[0] * SCALE_FACTOR, spriteDef.scale[1] * SCALE_FACTOR, 1);
        }
    }

    private setVisibility(spriteDef: any, sprite: Sprite) {
        if (spriteDef.visibleOnStyle) {
            sprite.visible = spriteDef.visibleOnStyle.includes('default');
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

export interface HudFactoryParameters extends EntityFactoryParameters {
    assets: GameAssets;
    player: Player;
    materialFactory: MaterialFactory;
    spriteTextFactory: SpriteTextFactory;
}
