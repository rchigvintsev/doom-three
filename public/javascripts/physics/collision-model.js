var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.CollisionModel = function () {
        this.bodies = [];
        this.bodyMeshes = {};
        this.dynamic = false;
    };

    DT.CollisionModel.prototype = {
        constructor: DT.CollisionModel,

        addBody: function (body) {
            this.bodies.push(body);
            if (body.mass > 0)
                this.dynamic = true;
        },

        attachMesh: function (body, mesh) {
            if (!this.bodyMeshes[body.id])
                this.bodyMeshes[body.id] = [];
            this.bodyMeshes[body.id].push(mesh);
        },

        updateAttachedMeshes: function () {
            for (var j = 0; j < this.bodies.length; j++) {
                var body = this.bodies[j];
                var meshes = this.bodyMeshes[body.id];
                if (meshes)
                    for (var k = 0; k < meshes.length; k++) {
                        var mesh = meshes[k];
                        mesh.position.copy(body.position);
                        mesh.quaternion.copy(body.quaternion);
                    }
            }
        },

        get attachedMeshes() {
            var result = [];
            for (var i = 0; i < this.bodies.length; i++) {
                var meshes = this.bodyMeshes[this.bodies[i].id];
                if (meshes)
                    for (var j = 0; j < meshes.length; j++)
                        result.push(meshes[j]);
            }
            return result;
        }
    }
})(DOOM_THREE);

export const CollisionModel = DOOM_THREE.CollisionModel;
