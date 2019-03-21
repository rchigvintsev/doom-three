import {MaterialBuilder} from './material-builder.js';
import {AssetLoader} from '../../asset-loader.js';

export class GuiMaterialBuilder extends MaterialBuilder {
    constructor(assets) {
        super(assets);
        this._tgaLoader = new THREE.TGALoader();
    }

    clone() {
        return new GuiMaterialBuilder(this._assets);
    }

    build(name, materialDefinition) {
        // Some textures may not be loaded in advance. We are going to load them here.

        let diffuseMap = null;
        if (materialDefinition.diffuseMap) {
            const diffuseMapName = typeof materialDefinition.diffuseMap === 'string' ? materialDefinition.diffuseMap
                : materialDefinition.diffuseMap.name;
            diffuseMap = this._assets[AssetLoader.AssetType.TEXTURES][diffuseMapName];
            if (!diffuseMap) {
                diffuseMap = this._tgaLoader.load(diffuseMapName + '.tga');
                if (materialDefinition.clamp)
                    diffuseMap.wrapS = diffuseMap.wrapT = THREE.ClampToEdgeWrapping;
                else
                    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
                this._assets[AssetLoader.AssetType.TEXTURES][diffuseMapName] = diffuseMap;
            }
        }

        materialDefinition.type = 'shader'; // GUI supports only shader materials
        const material = super.build(name, materialDefinition);
        material.side = THREE.DoubleSide;
        if (diffuseMap)
            material.uniforms.map.value = diffuseMap;
        return material;
    }

    newShaderMaterial(name, definition) {
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
                .translate(xTranslate(time), yTranslate(time))
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
