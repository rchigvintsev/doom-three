export class Surface extends THREE.Mesh {
    constructor(geometry, materials, body) {
        super(geometry, materials[0]);
        this._materials = materials;
        for (let i = 1; i < materials.length; i++) {
            this.add(new THREE.Mesh(geometry, materials[i]));
        }
        this._body = body;
        this.castShadow = true;
        this.receiveShadow = true;
    }

    get body() {
        return this._body;
    }

    update(time) {
        for (const material of this._materials) {
            material.update(time);
        }
    }

    takePunch(force, worldPoint) {
        if (this._body) {
            this._body.takePunch(force, worldPoint);
        }
    }
}
