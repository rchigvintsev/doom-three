import {Tables} from './tables.js';

export const UpdatableMaterialMixin = Base => class extends Base {
    _colorExpressions;

    constructor(parameters) {
        super(parameters);
    }

    set colorExpressions(colorExpressions) {
        this._colorExpressions = colorExpressions;
    }

    set colorValue(colorValue) {
        if (Array.isArray(colorValue)) {
            this.color.setRGB(colorValue[0], colorValue[1], colorValue[2]);
        } else {
            this.color.setHex(colorValue);
        }
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
}
