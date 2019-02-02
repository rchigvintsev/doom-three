var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.SurfaceBody = function (collisionModel) {
        this._collisionModel = collisionModel;
    };

    DT.SurfaceBody.prototype = {
        constructor: DT.SurfaceBody,

        get collisionModel() {
            return this._collisionModel;
        },

        takePunch: function () {
            // Do nothing
        }
    }
})(DOOM_THREE);

export const SurfaceBody = DOOM_THREE.SurfaceBody;
