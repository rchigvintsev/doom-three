import {AbstractModelFactory} from './abstract-model-factory.js';
import {MD5Loader} from '../../loader/md5-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {ModelMaterialBuilder} from '../material/model-material-builder.js';

class MD5ModelMaterialBuilder extends ModelMaterialBuilder {
    build(name, materialDefinition) {
        const material = super.build(name, materialDefinition);
        if (Array.isArray(material))
            material[0].skinning = true;
        else
            material.skinning = true;
        return material;
    }
}

export class MD5ModelFactory extends AbstractModelFactory {
    constructor(assets, flashlight) {
        super(new MD5ModelMaterialBuilder(assets, flashlight), 'MD5');
        this._assets = assets;
        this.md5Loader = new MD5Loader();
    }

    loadModel(modelDef) {
        const model = this._assets[AssetLoader.AssetType.MODELS][modelDef.name];
        const animations = [];
        for (let i = 0; i < modelDef.animations.length; i++)
            animations.push(this._assets[AssetLoader.AssetType.ANIMATIONS][modelDef.animations[i]]);
        return this.md5Loader.load(model, animations);
    }

    createWireframeMaterial() {
        const material = super.createWireframeMaterial();
        material.skinning = true;
        return material;
    }

    _rotateMesh(mesh) {
        mesh.rotation.set(THREE.Math.degToRad(-90), 0, THREE.Math.degToRad(90));
    }
}