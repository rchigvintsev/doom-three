import {Euler} from 'three';
import {degToRad} from 'three/src/math/MathUtils';

import {Tween} from '@tweenjs/tween.js';

import {Weapon} from './weapon';
import {Md5ModelParameters} from '../md5-model';

export abstract class Firearm extends Weapon {
    readonly recoilTween: Tween<Euler>;

    constructor(parameters: FirearmParameters) {
        super(parameters);
        this.recoilTween = this.createRecoilTween(parameters);
    }

    private createRecoilTween(parameters: FirearmParameters): Tween<Euler> {
        const rotation = new Euler();
        const recoilTimeTo = parameters.recoilTime * 0.4;
        const recoilTimeFrom = parameters.recoilTime * 0.6;
        return new Tween(rotation)
            .to({x: degToRad(parameters.recoilAngle)}, recoilTimeTo)
            .chain(new Tween(rotation).to({x: 0}, recoilTimeFrom).onUpdate((object, elapsed) => {
                const updateCallback = (<any>this.recoilTween)._onUpdateCallback;
                if (updateCallback) {
                    updateCallback(object, elapsed);
                }
            }));
    }

    abstract getAmmoClip(): number;

    abstract getAmmoReserve(): number;

    abstract isLowAmmo(): boolean;

    abstract reload(): void;
}

export function isFirearm(weapon: any): weapon is Firearm {
    return weapon instanceof Firearm;
}

export interface FirearmParameters extends Md5ModelParameters {
    recoilAngle: number;
    recoilTime: number;
}
