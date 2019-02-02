import {inherit} from '../util/oop-utils.js';

var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.Surface = function (geometry, material, body) {
        THREE.Mesh.apply(this, arguments);
        this._body = body;
    };

    DT.Surface.prototype = inherit(THREE.Mesh, {
        constructor: DT.Surface,

        get body() {
            return this._body;
        },

        update: function () {
            if (this.material.update)
                this.material.update();
        },

        takePunch: function (force, worldPoint) {
            if (this._body)
                this._body.takePunch(force, worldPoint);
        }
    });
})(DOOM_THREE);

export const Surface = DOOM_THREE.Surface;
