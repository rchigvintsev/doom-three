import {Texture} from 'three';

import {EvalFunction} from 'mathjs';

export class UpdatableTexture extends Texture {
    private scrollX?: EvalFunction;
    private scrollY?: EvalFunction;
    private _rotate?: EvalFunction;

    private readonly evalScope: any;

    constructor(parentEvalScope: any) {
        super();
        this.evalScope = {...parentEvalScope, ...{time: 0}};
    }

    update(_deltaTime: number) {
        this.updateTransformMatrix();
    }

    setParameters(params: Map<string, any>) {
        params.forEach((value, key) => this.evalScope[key] = value);
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
            this.evalScope.time = now * 0.01;
            if (this.scrollX) {
                scrollX = this.scrollX.evaluate(this.evalScope) * this.repeat.x;
            }
            if (this.scrollY) {
                scrollY = this.scrollY.evaluate(this.evalScope) * this.repeat.y;
            }
        }

        let rotate = 0;
        if (this._rotate) {
            this.evalScope.time = now * 0.005;
            rotate = this._rotate.evaluate(this.evalScope);
        }

        this.matrix.setUvTransform(scrollX, scrollY, this.repeat.x, this.repeat.y, rotate,
            this.center.x, this.center.y);
    }
}