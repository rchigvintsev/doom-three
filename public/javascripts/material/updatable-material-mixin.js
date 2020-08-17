import {Tables} from './tables.js';

export const UpdatableMaterialMixin = Base => class extends Base {
    _colorExpressions;
    _opacityExpression;
    _repeatExpressions;
    _rotateExpression;
    _translateExpressions;
    _scrollExpressions;
    _repeat;
    _scale;
    _center;

    constructor(parameters) {
        super(parameters);
    }

    set colorExpressions(colorExpressions) {
        this._colorExpressions = colorExpressions;
    }

    set opacityExpression(opacityExpression) {
        this._opacityExpression = opacityExpression;
    }

    set repeatExpressions(repeatExpressions) {
        this._repeatExpressions = repeatExpressions;
    }

    set rotateExpression(rotateExpression) {
        this._rotateExpression = rotateExpression;
    }

    set translateExpressions(translateExpressions) {
        this._translateExpressions = translateExpressions;
    }

    set scrollExpressions(scrollExpressions) {
        this._scrollExpressions = scrollExpressions;
    }

    set repeat(repeat) {
        this._repeat = repeat;
    }

    set scale(scale) {
        this._scale = scale;
    }

    set center(center) {
        this._center = center;
    }

    set colorValue(colorValue) {
        if (Array.isArray(colorValue)) {
            this.color.setRGB(colorValue[0], colorValue[1], colorValue[2]);
        } else {
            this.color.setHex(colorValue);
        }
    }

    set opacityValue(opacity) {
        this.opacity = opacity;
    }

    _updateColor(time) {
        if (this._colorExpressions && this._colorExpressions.length > 0) {
            let r, g, b;
            const scope = {time: time * 0.0025, table: Tables.getTableValue};
            if (this._colorExpressions.length === 1) {
                r = g = b = this._colorExpressions[0].eval(scope);
            } else if (this._colorExpressions.length === 3) {
                r = this._colorExpressions[0].eval(scope);
                g = this._colorExpressions[1].eval(scope);
                b = this._colorExpressions[2].eval(scope);
            } else {
                throw 'Invalid number of color expressions: ' + this._colorExpressions.length;
            }
            this.colorValue = [r, g, b];
        }
    }

    _updateOpacity(time) {
        if (this._opacityExpression) {
            const scope = {time: time * 0.01, table: Tables.getTableValue};
            this.opacityValue = this._opacityExpression.eval(scope);
        }
    }

    _updateTransformMatrices(time) {
        this._updateTransformMatrix(this.map, time);
        this._updateTransformMatrix(this.normalMap, time);
        this._updateTransformMatrix(this.specularMap, time);
        this._updateTransformMatrix(this.alphaMap, time);
    }

    _updateTransformMatrix(map, time) {
        if (map && map.image && !map.matrixAutoUpdate) {
            const scale = this._getScale(time);
            const center = this._getCenter();
            const rotation = this._getRotation(time);
            const translation = this._getTranslation(scale, time);

            map.matrix.identity()
                .scale(scale.x, scale.y)
                .translate(-center.x, -center.y)
                .rotate(rotation)
                .translate(center.x, center.y)
                .translate(translation.x, translation.y);
        }
    }

    _getScale = (() => {
        const scale = new THREE.Vector2(1.0, 1.0);

        return (time) => {
            if (this._repeat) {
                scale.set(this._repeat[0], this._repeat[1]);
            } else if (this._scale) {
                scale.set(this._scale[0], this._scale[1]);
            }

            if (this._repeatExpressions && this._repeatExpressions.length > 0) {
                if (this._repeatExpressions.length > 2) {
                    throw 'Invalid number of repeat expressions: ' + this._repeatExpressions.length;
                }
                const scope = {time: time * 0.004, table: Tables.getTableValue};
                if (this._repeatExpressions[0]) {
                    scale.setX(this._repeatExpressions[0].eval(scope) * this._scale ? this._scale[0] : 1.0);
                }
                if (this._repeatExpressions[1]) {
                    scale.setY(this._repeatExpressions[1].eval(scope) * this._scale ? this._scale[1] : 1.0);
                }
            }

            return scale;
        };
    })();

    _getCenter = (() => {
        const center = new THREE.Vector2(0.5, 0.5);

        return () => {
            if (this._center) {
                center.set(this._center[0], this._center[1]);
            }
            return center;
        };
    })();

    _getRotation(time) {
        if (this._rotateExpression) {
            const scope = {time: time * 0.0075};
            return this._rotateExpression.eval(scope) * -1;
        }
        return 0;
    }

    _getTranslation = (() => {
        const translation = new THREE.Vector2(0.0, 0.0);

        return (scale, time) => {
            if (this._translateExpressions && this._translateExpressions.length > 0) {
                if (this._translateExpressions.length !== 2) {
                    throw 'Invalid number of translate expressions: ' + this._translateExpressions.length;
                }
                const scope = {time: time * 0.001, table: Tables.getTableValue};
                translation.setX(this._translateExpressions[0].eval(scope));
                translation.setY(this._translateExpressions[1].eval(scope));
            } else if (this._scrollExpressions && this._scrollExpressions.length > 0) {
                if (this._scrollExpressions.length !== 2) {
                    throw 'Invalid number of scroll expressions: ' + this._scrollExpressions.length;
                }
                const scope = {time: time * 0.001, table: Tables.getTableValue};
                translation.setX(this._scrollExpressions[0].eval(scope));
                scope.time *= scale.y;
                translation.setY(this._scrollExpressions[1].eval(scope));
            }
            return translation;
        };
    })();
}
