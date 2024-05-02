import {Object3D, OrthographicCamera, Scene} from 'three';

import {GameEntity} from '../game-entity';
import {isUpdatableMaterial} from '../../material/updatable-material';
import {SpriteText} from '../text/sprite-text';
import {Player} from '../player/player';
import {isFirearm} from '../model/md5/weapon/firearm';
import {Weapon} from '../model/md5/weapon/weapon';
import {HudElement} from './hud-element';
import {Game} from '../../game';

export class Hud implements GameEntity {
    private readonly scene = new Scene();
    private readonly camera: OrthographicCamera;

    constructor(private readonly parameters: HudParameters) {
        this.camera = this.createCamera();

        for (const element of this.parameters.crosshair) {
            this.scene.add(element);
        }
        for (const element of this.parameters.ammoIndicator) {
            this.scene.add(element);
        }
        for (const element of this.parameters.weaponIndicator) {
            this.scene.add(element);
        }
    }

    init() {
        // Do nothing
    }

    update(deltaTime: number) {
        for (const element of this.parameters.crosshair) {
            const material = (<any>element).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
        this.parameters.ammoIndicator.update(deltaTime, this.parameters.player.currentWeapon);
        for (const child of this.parameters.weaponIndicator) {
            const material = (<any>child).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
    }

    render() {
        const renderer = Game.getContext().renderer;
        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();

        for (const element of this.parameters.crosshair) {
            element.updatePosition();
        }
        this.parameters.ammoIndicator.updatePosition();
        for (const element of this.parameters.weaponIndicator) {
            element.updatePosition();
        }
    }

    private createCamera(): OrthographicCamera {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -500, 1000);
    }
}

export interface HudParameters {
    player: Player;
    crosshair: HudElement[];
    ammoIndicator: AmmoIndicator;
    weaponIndicator: HudElement[];
}

export class AmmoIndicator implements Iterable<Object3D> {
    private _visible = true;
    private style = AmmoIndicatorStyle.DEFAULT;

    constructor(private readonly background: HudElement[],
                private readonly ammoClipText: SpriteText[],
                private readonly ammoReserveText: SpriteText[]) {
        this.visible = false;
    }

    *[Symbol.iterator](): IterableIterator<Object3D> {
        for (let i = 0; i < this.background.length; i++) {
            yield this.background[i];
        }
        for (let i = 0; i < this.ammoClipText.length; i++) {
            yield this.ammoClipText[i];
        }
        for (let i = 0; i < this.ammoReserveText.length; i++) {
            yield this.ammoReserveText[i];
        }
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(visible: boolean) {
        if (this._visible !== visible) {
            this._visible = visible;
            for (const backgroundElement of this.background) {
                if (backgroundElement.visibleOnStyle) {
                    backgroundElement.visible = visible && backgroundElement.visibleOnStyle.includes(this.style);
                } else {
                    backgroundElement.visible = visible;
                }
            }
            for (const textElement of this.ammoClipText) {
                textElement.visible = visible;
            }
            for (const textElement of this.ammoReserveText) {
                textElement.visible = visible;
            }
        }
    }

    update(deltaTime: number, weapon?: Weapon) {
        if (isFirearm(weapon)) {
            this.setAmmo(weapon.ammoClip);
            this.setAmmoReserve(weapon.ammoReserve);

            let style = AmmoIndicatorStyle.DEFAULT;
            if (weapon.ammoClip === 0) {
                style = weapon.ammoReserve === 0 ? AmmoIndicatorStyle.EMPTY_AMMO : AmmoIndicatorStyle.EMPTY_CLIP;
            } else if (weapon.isLowAmmo()) {
                style = AmmoIndicatorStyle.LOW_AMMO;
            }
            this.setStyle(style);

            this.visible = true;
        } else {
            this.visible = false;
        }

        if (this._visible) {
            for (const backgroundElement of this.background) {
                if (isUpdatableMaterial(backgroundElement.material)) {
                    backgroundElement.material.update(deltaTime);
                }
            }
            for (const textElement of this.ammoClipText) {
                textElement.update(deltaTime);
            }
            for (const textElement of this.ammoReserveText) {
                textElement.update(deltaTime);
            }
        }
    }

    updatePosition() {
        for (const backgroundElement of this.background) {
            backgroundElement.updatePosition();
        }
        for (const textElement of this.ammoClipText) {
            textElement.updatePosition();
        }
        for (const textElement of this.ammoReserveText) {
            textElement.updatePosition();
        }
    }

    setAmmo(value: number) {
        for (const textElement of this.ammoClipText) {
            textElement.text = value.toString();
        }
    }

    setAmmoReserve(value: number) {
        for (const textElement of this.ammoReserveText) {
            textElement.text = value.toString();
        }
    }

    private setStyle(style: AmmoIndicatorStyle) {
        if (this.style !== style) {
            this.style = style;
            for (const backgroundElement of this.background) {
                backgroundElement.applyStyle(style);
                if (backgroundElement.visibleOnStyle && this._visible) {
                    backgroundElement.visible = backgroundElement.visibleOnStyle.includes(style);
                }
            }
            for (const textElement of this.ammoClipText) {
                textElement.applyStyle(style);
            }
            for (const textElement of this.ammoReserveText) {
                textElement.applyStyle(style);
            }
        }
    }
}

enum AmmoIndicatorStyle {
    DEFAULT = 'default', LOW_AMMO = 'low_ammo', EMPTY_CLIP = 'empty_clip', EMPTY_AMMO = 'empty_ammo'
}
