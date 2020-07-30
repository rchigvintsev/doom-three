var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.PhysicsSystem = function () {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.8, 0);
        this.world.allowSleep = true;

        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;

        var solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.world.solver = new CANNON.SplitSolver(solver);

        this.materials = {};
        this.materials['default'] = this.world.defaultMaterial;

        var playerMaterial = new CANNON.Material();
        this.materials['models/player'] = playerMaterial;

        var floorMaterial = new CANNON.Material();
        this.materials['floor'] = floorMaterial;

        this.world.addContactMaterial(new CANNON.ContactMaterial(playerMaterial, this.world.defaultMaterial,
            {friction: 0.03, restitution: 0, frictionEquationRelaxation: 30}));
        this.world.addContactMaterial(new CANNON.ContactMaterial(playerMaterial, floorMaterial,
            {restitution: 0, frictionEquationRelaxation: 0.1}));

        this.dynamicModels = [];
    };

    DT.PhysicsSystem.prototype = {
        constructor: DT.PhysicsSystem,

        registerBody: function (body) {
            var self = this;
            body.collisionModel.bodies.forEach(function (b) {
                self.world.addBody(b);
            });
            if (body.collisionModel.dynamic)
                this.dynamicModels.push(body.collisionModel);
        },

        update: function (timeStep) {
            this.world.step(timeStep);
            for (var i = 0; i < this.dynamicModels.length; i++)
                this.dynamicModels[i].updateAttachedMeshes();
        }
    }
})(DOOM_THREE);

export const PhysicsSystem = DOOM_THREE.PhysicsSystem;
