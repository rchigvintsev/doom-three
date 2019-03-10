export class MapArea {
    constructor() {
        this._objects = [];
        this._updatableObjects = [];
        this._namedObjects = {};
    }

    get objects() {
        return this._objects;
    }

    add(object)  {
        this._objects.push(object);
        if (object.update)
            this._updatableObjects.push(object);
        if (object.name)
            this._namedObjects[object.name] = object;
    }

    update(time) {
        for (let i = 0; i < this._updatableObjects.length; i++) {
            const obj = this._updatableObjects[i];
            obj.update(time);
        }
    }

    objectByName(name) {
        return this._namedObjects[name];
    }
}