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
        for (const child of this.parameters.ammoCounter) {
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
            this.parameters.ammoCounter.visible = true;
            this.parameters.ammoCounter.setValue(currentWeapon.ammo());
        } else {
            this.parameters.ammoCounter.visible = false;
        }

        for (const child of this.parameters.crosshair) {
            const material = (<any>child).material;
            if (isUpdatableMaterial(material)) {
                material.update(deltaTime);
            }
        }
        this.parameters.ammoCounter.update(deltaTime);
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
    ammoCounter: AmmoCounter;
    weaponIndicator: Object3D[];
}

export class AmmoCounter implements Iterable<Object3D> {
    private _visible = true;

    constructor(private readonly background: Sprite[], private readonly text: SpriteText) {
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
            this.text.visible = visible;
        }
    }

    setValue(value: number) {
        this.text.text = value.toString();
    }

    update(deltaTime: number) {
        if (this._visible) {
            for (const backgroundElement of this.background) {
                if (isUpdatableMaterial(backgroundElement.material)) {
                    backgroundElement.material.update(deltaTime);
                }
            }
            this.text.update(deltaTime);
        }
    }

    *[Symbol.iterator](): IterableIterator<Object3D> {
        for (let i = 0; i < this.background.length; i++) {
            yield this.background[i];
        }
        yield this.text;
    }
}