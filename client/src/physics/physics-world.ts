import {Material, World, ContactMaterial} from 'cannon-es';

export class PhysicsWorld extends World {
    readonly materials = new Map<string, Material>();

    constructor() {
        super();
        this.gravity.set(0, -9.8, 0);
        this.initMaterials();
    }

    private initMaterials() {
        this.materials.set('default', this.defaultMaterial);
        const playerMaterial = new Material();
        this.materials.set('models/player', playerMaterial);
        const floorMaterial = new Material();
        this.materials.set('floor', floorMaterial);
        this.addContactMaterial(new ContactMaterial(playerMaterial, this.defaultMaterial, {
            friction: 0.02,
            restitution: 0,
            frictionEquationRelaxation: 20
        }));
        this.addContactMaterial(new ContactMaterial(playerMaterial, floorMaterial, {
            restitution: 0,
            frictionEquationRelaxation: 0.1
        }));
    }
}