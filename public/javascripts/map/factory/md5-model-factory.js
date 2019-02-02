import {inherit} from '../../util/oop-utils.js';
import {AbstractModelFactory} from './abstract-model-factory.js';
import {MD5Loader} from '../../loader/md5-loader.js';
import {AssetLoader} from '../../asset-loader.js';
import {ModelMaterialBuilder} from '../material/model-material-builder.js';

var DOOM_THREE = DOOM_THREE || {};

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

(function (DT) {
    DT.MD5ModelFactory = function (assets, flashlight) {
        AbstractModelFactory.call(this, new MD5ModelMaterialBuilder(assets, flashlight), 'MD5');
        this.assets = assets;
        this.md5Loader = new MD5Loader();
    };

    DT.MD5ModelFactory.prototype = inherit(AbstractModelFactory, {
        constructor: DT.MD5ModelFactory,

        loadModel: function (modelDef) {
            var model = this.assets[AssetLoader.AssetType.MODELS][modelDef.name];
            var animations = [];
            for (var i = 0; i < modelDef.animations.length; i++)
                animations.push(this.assets[AssetLoader.AssetType.ANIMATIONS][modelDef.animations[i]]);
            return this.md5Loader.load(model, animations);
        },

        rotateMesh: function (mesh) {
            mesh.rotation.set(THREE.Math.degToRad(-90), 0, THREE.Math.degToRad(90));
        },

        createWireframeMaterial: function () {
            var $super = Object.getPrototypeOf(DT.MD5ModelFactory.prototype).createWireframeMaterial;
            var material = $super.call(this);
            material.skinning = true;
            return material;
        },
    });
})(DOOM_THREE);

export const MD5ModelFactory = DOOM_THREE.MD5ModelFactory;
