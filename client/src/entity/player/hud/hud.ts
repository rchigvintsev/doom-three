import {Object3D, OrthographicCamera, Scene, Sprite, WebGLRenderer} from 'three';

import {Entity} from '../../entity';
import {GameConfig} from '../../../game-config';
import {isUpdatableMaterial} from '../../../material/updatable-material';
import {SpriteText} from '../../text/sprite-text';
import {Player} from '../player';
import {isFirearm} from '../../model/md5/weapon/firearm';

export class Hud implements Entity {
    private readonly scene = new Scene();
    private readonly camera: OrthographicCamera;

    constructor(private readonly parameters: HudParameters) {
        this.camera = this.createCamera(this.parameters.config);

        for (const child of this.parameters.crosshair) {
            this.scene.add(child);
        }
        for (const child of this.parameters.ammoIndicator) {
            this.scene.add(child);
        }
        for (const child of this.parameters.weaponIndicator) {
            this.scene.add(child);
        }
    }

    init() {
        // Do nothing
    }

    update(deltaTime: number) {
        const currentWeapon = this.parameters.player.getCurrentWeapon();
        if (isFirearm(currentWeapon)) {
            this.parameters.ammoIndicator.setAmmo(currentWeapon.getAmmo());
            this.parameters.ammoIndicator.setAmmoReserve(currentWeapon.getAmmoReserve());
            this.parameters.ammoIndicator.visible = true;
        } else {
            this.parameters.ammoIndicator.visible = false;
        }

        for (const child of this.parameters.crosshair) {
            const material = (<any>child).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
        this.parameters.ammoIndicator.update(deltaTime);
        for (const child of this.parameters.weaponIndicator) {
            const material = (<any>child).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
    }

    render(renderer: WebGLRenderer) {
        renderer.clearDepth();
        renderer.render(this.scene, this.camera);
    }

    private createCamera(_config: GameConfig): OrthographicCamera {
        const width = window.innerWidth;
        const height = window.innerHeight;
        return new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -500, 1000);
    }
}

export interface HudParameters {
    config: GameConfig;
    player: Player;
    crosshair: Object3D[];
    ammoIndicator: AmmoIndicator;
    weaponIndicator: Object3D[];
}

export class AmmoIndicator implements Iterable<Object3D> {
    private _visible = true;

    constructor(private readonly background: Sprite[],
                private readonly ammoText: SpriteText[],
                private readonly ammoReserveText: SpriteText[]) {
        this.visible = false;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(visible: boolean) {
        if (this._visible !== visible) {
            this._visible = visible;
            for (const backgroundElement of this.background) {
                backgroundElement.visible = visible;
            }
            for (const textElement of this.ammoText) {
                textElement.visible = visible;
            }
            for (const textElement of this.ammoReserveText) {
                textElement.visible = visible;
            }
        }
    }

    setAmmo(value: number) {
        for (const textElement of this.ammoText) {
            textElement.text = value.toString();
        }
    }

    setAmmoReserve(value: number) {
        for (const textElement of this.ammoReserveText) {
            textElement.text = value.toString();
        }
    }

    update(deltaTime: number) {
        if (this._visible) {
            for (const backgroundElement of this.background) {
                if (isUpdatableMaterial(backgroundElement.material)) {
                    backgroundElement.material.update(deltaTime);
                }
            }
            for (const textElement of this.ammoText) {
                textElement.update(deltaTime);
            }
            for (const textElement of this.ammoReserveText) {
                textElement.update(deltaTime);
            }
        }
    }

    *[Symbol.iterator](): IterableIterator<Object3D> {
        for (let i = 0; i < this.background.length; i++) {
            yield this.background[i];
        }
        for (let i = 0; i < this.ammoText.length; i++) {
            yield this.ammoText[i];
        }
        for (let i = 0; i < this.ammoReserveText.length; i++) {
            yield this.ammoReserveText[i];
        }
    }
}