import * as TWEEN from '@tweenjs/tween.js';

import {GameSystem} from '../game-system';

export class TweenAnimationSystem implements GameSystem {
    update(_deltaTime: number) {
        TWEEN.update();
    }
}
