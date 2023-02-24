import {Color, SpriteMaterial} from 'three';

import {GameEntityFactory, GameEntityFactoryParameters} from '../game-entity-factory';
import {AmmoIndicator, Hud} from './hud';
import {MaterialFactory} from '../../material/material-factory';
import {GameAssets} from '../../game-assets';
import {SpriteTextFactory} from '../text/sprite-text-factory';
import {SpriteText} from '../text/sprite-text';
import {Player} from '../player/player';
import {MaterialStyle} from '../../material/stylable-material';
import {HudElement} from './hud-element';
import {ScreenPosition} from '../../util/screen-position';

const SCALE_FACTOR = 2;

export class HudFactory implements GameEntityFactory<Hud> {
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

    private createCrosshair(hudDef: any): HudElement[] {
        const crosshair = [];
        for (const hudElementDef of hudDef.crosshair) {
            crosshair.push(this.createHudElement(hudElementDef));
        }
        return crosshair;
    }

    private createAmmoIndicator(hudDef: any): AmmoIndicator {
        const background: HudElement[] = [];
        for (const hudElementDef of hudDef.ammoIndicator.background) {
            background.push(this.createHudElement(hudElementDef));
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

    private createWeaponIndicator(hudDef: any): HudElement[] {
        const weaponIndicator = [];
        for (const hudElementDef of hudDef.weaponIndicator) {
            weaponIndicator.push(this.createHudElement(hudElementDef));
        }
        return weaponIndicator;
    }

    private createHudElement(hudElementDef: any): HudElement {
        const spriteMaterials = this.parameters.materialFactory.create(hudElementDef.material || hudElementDef.name);
        const material = <SpriteMaterial>spriteMaterials[0];
        const hudElement = new HudElement({
            material,
            screenPosition: this.getHudElementScreenPosition(hudElementDef),
            styles: this.getHudElementStyles(hudElementDef),
            visibleOnStyle: hudElementDef.visibleOnStyle
        });
        hudElement.name = hudElementDef.name;
        this.setHudElementScale(hudElementDef, hudElement);
        this.setHudElementVisibility(hudElementDef, hudElement);
        hudElement.updatePosition();
        return hudElement;
    }

    private createSpriteText(textDef: any) {
        const spriteText = this.parameters.spriteTextFactory.create(textDef);
        spriteText.scale.multiplyScalar(SCALE_FACTOR);
        return spriteText;
    }

    private getHudElementScreenPosition(hudElementDef: any): ScreenPosition {
        const position = hudElementDef.position;
        if (position) {
            return new ScreenPosition(position.left, position.right, position.top, position.bottom);
        }
        return new ScreenPosition();
    }

    private getHudElementStyles(hudElementDef: any): Map<string, MaterialStyle> | undefined {
        if (hudElementDef.styles) {
            const styles = new Map<string, MaterialStyle>();
            for (const styleName of Object.keys(hudElementDef.styles)) {
                const styleDef = hudElementDef.styles[styleName];
                styles.set(styleName, new MaterialStyle(styleName, new Color().setHex(styleDef.color)));
            }
            return styles;
        }
        return undefined;
    }

    private setHudElementScale(hudElementDef: any, hudElement: HudElement) {
        if (hudElementDef.scale) {
            hudElement.scale.set(hudElementDef.scale[0] * SCALE_FACTOR, hudElementDef.scale[1] * SCALE_FACTOR, 1);
        }
    }

    private setHudElementVisibility(hudElementDef: any, hudElement: HudElement) {
        if (hudElementDef.visibleOnStyle) {
            hudElement.visible = hudElementDef.visibleOnStyle.includes('default');
        }
    }
}

export interface HudFactoryParameters extends GameEntityFactoryParameters {
    assets: GameAssets;
    player: Player;
    materialFactory: MaterialFactory;
    spriteTextFactory: SpriteTextFactory;
}
