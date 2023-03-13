import {ContactMaterial, GSSolver, Material, SplitSolver, World} from 'cannon-es';

import {injectable} from 'inversify';

import {PhysicsManager} from '../physics-manager';

@injectable()
export class CannonPhysicsManager extends World implements PhysicsManager {
    readonly physicsManager = true;
    readonly materials = new Map<string, Material>();

    constructor() {
        super();
        this.gravity.set(0, -9.8, 0);
        this.allowSleep = true;
        this.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.defaultContactMaterial.contactEquationRelaxation = 4;
        this.solver = new SplitSolver(new GSSolver());
        this.initMaterials();
    }

    update(_deltaTime: number) {
        this.fixedStep();
    }

    private initMaterials() {
        this.materials.set('default', this.defaultMaterial);
        const playerMaterial = new Material();
        this.materials.set('models/player', playerMaterial);
        const monsterMaterial = new Material();
        this.materials.set('models/monster', monsterMaterial);
        const floorMaterial = new Material();
        this.materials.set('floor', floorMaterial);
        const weaponShellMaterial = new Material();
        this.materials.set('models/weapons/shell', weaponShellMaterial);
        this.addContactMaterial(new ContactMaterial(playerMaterial, this.defaultMaterial, {
            friction: 0.02,
            restitution: 0,
            frictionEquationRelaxation: 20
        }));
        this.addContactMaterial(new ContactMaterial(playerMaterial, floorMaterial, {
            restitution: 0,
            frictionEquationRelaxation: 0.1
        }));
        this.addContactMaterial(new ContactMaterial(weaponShellMaterial, floorMaterial, {
            restitution: 0.4,
            contactEquationStiffness: 1e9,
            contactEquationRelaxation: 2
        }));
        this.addContactMaterial(new ContactMaterial(weaponShellMaterial, playerMaterial, {friction: 0}));
    }
}
