import {Texture} from 'three';

import {EvalFunction} from 'mathjs';

export class UpdatableTexture extends Texture {
    private scrollX?: EvalFunction;
    private scrollY?: EvalFunction;
    private _rotate?: EvalFunction;

    update(_deltaTime: number) {
        this.updateTransformMatrix();
    }

    setScroll(scrollX: EvalFunction, scrollY: EvalFunction) {
        this.scrollX = scrollX;
        this.scrollY = scrollY;
    }

    set rotate(rotate: EvalFunction) {
        this._rotate = rotate;
    }

    private updateTransformMatrix() {
        const now = performance.now();

        let scrollX = 0, scrollY = 0;
        if (this.scrollX || this.scrollY) {
            const evalScope = {time: now * 0.01};
            if (this.scrollX) {
                scrollX = this.scrollX.evaluate(evalScope);
            }
            if (this.scrollY) {
                scrollY = this.scrollY.evaluate(evalScope);
            }
        }

        let rotate = 0;
        if (this._rotate) {
            rotate = this._rotate.evaluate({time: now * 0.005});
        }

        this.matrix.setUvTransform(scrollX, scrollY, this.repeat.x, this.repeat.y, rotate, 0.5, 0.5);
    }
}