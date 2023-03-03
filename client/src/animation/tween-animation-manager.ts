import * as TWEEN from '@tweenjs/tween.js';

import {injectable} from 'inversify';

import {GameManager} from '../game-manager';

@injectable()
export class TweenAnimationManager implements GameManager {
    update(_deltaTime: number) {
        TWEEN.update();
    }
}
