var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.MapArea = function () {
        this._objects = [];
        this._updatableObjects = [];
    };

    DT.MapArea.prototype = {
        constructor: DT.MapArea,

        get objects() {
            return this._objects;
        },

        add: function (object)  {
            this._objects.push(object);
            if (object.update)
                this._updatableObjects.push(object);
        },

        update: function (time) {
            for (let i = 0; i < this._updatableObjects.length; i++) {
                const obj = this._updatableObjects[i];
                obj.update(time);
            }
        }
    }
})(DOOM_THREE);

export const MapArea = DOOM_THREE.MapArea;
