var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.AbstractMeshFactory = function (materialBuilder) {
        this._materialBuilder = materialBuilder;
    };

    DT.AbstractMeshFactory.prototype = {
        constructor: DT.AbstractMeshFactory,

        createRegularMaterial: function (name, materialDefinition) {
            return this._materialBuilder.build(name, materialDefinition);
        },

        createWireframeMaterial: function () {
            return this._materialBuilder.newBasicMaterial(true);
        }
    }
})(DOOM_THREE);

export const AbstractMeshFactory = DOOM_THREE.AbstractMeshFactory;
