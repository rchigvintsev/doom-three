import {ContactMaterial, Material, World} from 'cannon-es';

import {GameSystem} from '../game-system';

export class PhysicsSystem extends World implements GameSystem {
    readonly materials = new Map<string, Material>();

    constructor() {
        super();
        this.gravity.set(0, -9.8, 0);
        this.initMaterials();
    }

    update(_deltaTime: number) {
        this.fixedStep();
    }

    private initMaterials() {
        this.materials.set('default', this.defaultMaterial);
        const playerMaterial = new Material();
        this.materials.set('models/player', playerMaterial);
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