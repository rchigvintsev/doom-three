export class LwoModel extends THREE.Group {
    constructor(geometry, materials) {
        super();
        this._geometry = geometry;
        this._materials = materials;
        this._gui = [];
    }

    init() {
        this.add(new THREE.Mesh(this._geometry, this._materials));
    }

    addGui(gui) {
        this.add(gui);
        this._gui.push(gui);
    }

    get geometry() {
        return this._geometry;
    }

    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get body() {
        return this._body;
    }

    set body(body) {
        this._body = body;
    }

    update(time) {
        for (const gui of this._gui) {
            gui.update(time);
        }
        for (const material of this._materials) {
            material.update(time);
        }
    }
}
