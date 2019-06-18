export class Surface extends THREE.Mesh {
    constructor(geometry, materials, body) {
        super(geometry, materials[0]);
        for (let i = 1; i < materials.length; i++)
            this.add(new THREE.Mesh(geometry, materials[i]));
        this._body = body;
    }

    get body() {
        return this._body;
    }

    update() {
        if (this.material.update)
            this.material.update();
    }

    takePunch(force, worldPoint) {
        if (this._body)
            this._body.takePunch(force, worldPoint);
    }
}
