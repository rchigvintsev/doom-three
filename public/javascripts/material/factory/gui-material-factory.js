import {BaseMaterialFactory} from './base-material-factory.js';

export class GuiMaterialFactory extends BaseMaterialFactory {
    constructor(assetLoader) {
        super(assetLoader);
    }

    clone() {
        return new GuiMaterialFactory(this._assetLoader);
    }

    create(name, materialDef) {
        // Some textures may not be loaded in advance. We are going to load them here.
        this._assetLoader.loadTextures(materialDef);
        materialDef.type = 'shader'; // GUI supports only shader materials
        const materials = super.create(name, materialDef);
        materials[0].side = THREE.DoubleSide;
        return materials;
    }

    _createShaderMaterial(name, definition) {
        const basicShaderLib = THREE.ShaderLib['basic'];
        return new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(basicShaderLib.uniforms),
            vertexShader: basicShaderLib.vertexShader,
            fragmentShader: basicShaderLib.fragmentShader
        });
    }

    _createScalarColorUpdater(tableName, expression) {
        const updater = super._createScalarColorUpdater(tableName, expression);
        const dummyMaterial = new THREE.MeshBasicMaterial();
        return function (material, time) {
            updater(dummyMaterial, time);
            material.uniforms['diffuse'].value = dummyMaterial.color;
        };
    }

    _createRgbColorUpdater(red, green, blue) {
        const updater = super._createRgbColorUpdater(red, green, blue);
        const dummyMaterial = new THREE.MeshBasicMaterial();
        return function (material, time) {
            updater(dummyMaterial, time);
            material.uniforms['diffuse'].value = dummyMaterial.color;
        }
    }

    _createTransformUpdater(xRepeat, yRepeat, rotate, xTranslate, yTranslate, center) {
        if (!center)
            center = [0.5, 0.5];
        return function (material, time) {
            const transformMatrix = material.uniforms['uvTransform'].value;
            transformMatrix.identity()
                .scale(xRepeat(time), yRepeat(time))
                .translate(-center[0], -center[1])
                .rotate(rotate(time))
                .translate(center[0], center[1])
                .translate(xTranslate(time), yTranslate(time));
        };
    }

    _createOpacityUpdater(expression) {
        const updater = super._createOpacityUpdater(expression);
        return function (material, time) {
            updater(material, time);
            material.uniforms['opacity'].value = material.opacity;
        }
    }

    _setColor(material, color) {
        material.uniforms['diffuse'].value = new THREE.Color().setHex(color);
    }

    _setOpacity(material, opacity) {
        material.uniforms['opacity'].value = opacity;
    }
}
