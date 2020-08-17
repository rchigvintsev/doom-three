import {AssetLoader} from '../../asset-loader.js';
import {LightBasicMaterial} from '../light-basic-material.js';
import {TextureImageService} from '../../image/texture-image-service.js';
import {UpdatableMeshBasicMaterial} from '../updatable-mesh-basic-material.js';
import {UpdatableMeshPhongMaterial} from '../updatable-mesh-phong-material.js';
import {UpdatableShaderMaterial} from '../updatable-shader-material.js';

export class BaseMaterialFactory {
    constructor(assetLoader) {
        this._assetLoader = assetLoader;
        this._textureImageService = new TextureImageService(assetLoader);
    }

    clone() {
        return new BaseMaterialFactory(this._assetLoader);
    }

    create(name, materialDef) {
        let materials = [];

        const material = this._createMaterial(name, materialDef);
        materials.push(material);

        const clamp = materialDef.clamp;
        const materialParams = materialDef.parameters;

        if (materialDef.diffuseMap) {
            material.map = this._createTexture(materialDef.diffuseMap, clamp, materialParams, material.uniforms);
        }
        if (materialDef.normalMap) {
            material.normalMap = this._createTexture(materialDef.normalMap, clamp, materialParams);
        }
        if (materialDef.specularMap) {
            material.specularMap = this._createTexture(materialDef.specularMap, clamp, materialParams);
        }
        if (materialDef.alphaMap) {
            material.alphaMap = this._createTexture(materialDef.alphaMap, clamp, materialParams);
        }

        if (materialDef.alphaTest != null) {
            material.alphaTest = materialDef.alphaTest;
        }

        if (materialDef.color != null) {
            if (materialDef.color.expression) {
                material.colorExpressions = [math.compile(materialDef.color.expression)];
            } else if (materialDef.color.red && materialDef.color.green && materialDef.color.blue) {
                material.colorExpressions = [
                    math.compile(materialDef.color.red.expression),
                    math.compile(materialDef.color.green.expression),
                    math.compile(materialDef.color.blue.expression)
                ];
            } else {
                material.colorValue = materialDef.color;
            }
        }

        if (materialDef.transparent) {
            material.transparent = true;
            if (materialDef.opacity != null) {
                if (materialDef.opacity.expression) {
                    material.opacityExpression = math.compile(materialDef.opacity.expression);
                } else {
                    material.opacityValue = materialDef.opacity;
                }
            }
        }

        if (materialDef.blending) {
            this._setBlending(materialDef, material);
        }

        if (materialDef.specular != null) {
            material.specular = new THREE.Color().setHex(materialDef.specular);
        }
        if (materialDef.shininess != null) {
            material.shininess = materialDef.shininess;
        }
        if (materialDef.scale != null) {
            material.scale = materialDef.scale;
        }

        if (materialDef.repeat) {
            const repeat = [materialDef.repeat[0], materialDef.repeat[1]];
            const repeatExpressions = [];
            if (repeat[0].expression) {
                repeatExpressions[0] = math.compile(repeat[0].expression);
                repeat[0] = 1.0;
            }
            if (repeat[1].expression) {
                repeatExpressions[1] = math.compile(repeat[1].expression);
                repeat[1] = 1.0;
            }
            material.repeat = repeat;
            if (repeatExpressions.length > 0) {
                material.repeatExpressions = repeatExpressions;
            }

            this._disableMatrixAutoUpdate(material);
        }

        if (materialDef.center != null) {
            material.center = materialDef.center;
            this._disableMatrixAutoUpdate(material);
        }

        if (materialDef.rotate != null) {
            material.rotateExpression = math.compile(materialDef.rotate);
            this._disableMatrixAutoUpdate(material);
        }

        if (materialDef.translate) {
            material.translateExpressions = [
                math.compile(materialDef.translate[0]),
                math.compile(materialDef.translate[1])
            ];
            this._disableMatrixAutoUpdate(material);
        } else if (materialDef.scroll) {
            material.scrollExpressions = [
                math.compile(materialDef.scroll[0]),
                math.compile(materialDef.scroll[1])
            ];
            this._disableMatrixAutoUpdate(material);
        }

        if (materialDef.side === 'double') {
            material.side = THREE.DoubleSide;
        } else if (materialDef.side === 'front') {
            material.side = THREE.FrontSide;
        } else {
            material.side = THREE.BackSide;
        }

        if (materialDef.depthWrite != null) {
            material.depthWrite = materialDef.depthWrite;
        }

        if (materialDef.children) {
            for (const childDef of materialDef.children) {
                materials = materials.concat(this.create(null, childDef));
            }
        }

        return materials;
    }

    _disableMatrixAutoUpdate(material) {
        if (material.map) {
            material.map.matrixAutoUpdate = false;
        }
        if (material.normalMap) {
            material.normalMap.matrixAutoUpdate = false;
        }
        if (material.specularMap) {
            material.specularMap.matrixAutoUpdate = false;
        }
        if (material.alphaMap) {
            material.alphaMap.matrixAutoUpdate = false;
        }
    }

    _createMaterial(name, materialDef) {
        let material;
        if (materialDef.type === 'basic') {
            material = this._createBasicMaterial();
        } else if (materialDef.type === 'light_basic') {
            material = this._createLightBasicMaterial();
            if (materialDef.lightIntensity != null) {
                material.lightIntensity = materialDef.lightIntensity;
            }
        } else if (materialDef.type === 'shader') {
            material = this._createShaderMaterial(name, materialDef);
        } else {
            material = this._createPhongMaterial();
        }
        material.name = name;
        return material;
    }

    _createBasicMaterial(wireframe) {
        if (wireframe == null) {
            wireframe = false;
        }
        return new UpdatableMeshBasicMaterial({wireframe: wireframe});
    }

    _createLightBasicMaterial() {
        return new LightBasicMaterial();
    }

    _createShaderMaterial(name, materialDef) {
        const uniforms = {};
        const rotateExpressions = [];

        for (let i = 0; i < materialDef.textures.length; i++) {
            const textureDef = materialDef.textures[i];

            if (textureDef.repeat) {
                const offsetRepeat = new THREE.Vector4(0, 0, textureDef.repeat[0], textureDef.repeat[1]);
                uniforms['u_offsetRepeat' + (i + 1)] = {value: offsetRepeat};
            }

            if (textureDef.rotate) {
                uniforms['u_rotation' + (i + 1)] = {type: 'f', value: 0};
                rotateExpressions.push(math.compile(textureDef.rotate));
            }

            const texture = new THREE.Texture();
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            uniforms['u_texture' + (i + 1)] = {type: 't', value: texture};

            const textureName = this._getTextureName(textureDef);
            this._textureImageService.getTextureImage(textureName)
                .then(img => {
                    texture.image = img;
                    texture.needsUpdate = true;
                });
        }

        const material = new UpdatableShaderMaterial({
            uniforms: uniforms,
            vertexShader: this._assetLoader.assets[AssetLoader.AssetType.SHADERS][name].vertex,
            fragmentShader: this._assetLoader.assets[AssetLoader.AssetType.SHADERS][name].fragment
        });
        material.rotateExpressions = rotateExpressions;
        return material;
    }

    _createPhongMaterial() {
        return new UpdatableMeshPhongMaterial();
    }

    _getTextureName(mapDef, parameters) {
        if (typeof mapDef === 'string') {
            return mapDef;
        }
        if (typeof mapDef.name === 'string') {
            return mapDef.name;
        }
        if (!parameters) {
            throw 'Failed to determine parameterized texture name: parameters are not provided';
        }
        const paramName = Object.keys(mapDef.name)[0];
        if (!paramName) {
            throw 'Invalid material map definition: parameter is not defined for parameterized texture name';
        }
        const paramValue = parameters[paramName];
        const textureName = mapDef.name[paramName][paramValue];
        if (!textureName) {
            throw 'Failed to determine parameterized texture name: texture name is not defined for value "'
            + paramValue + '" of parameter "' + paramName + '"';
        }
        return textureName;
    }

    _createTexture(textureDef, clamp, parameters, uniforms) {
        const texture = new THREE.Texture();
        if (clamp) {
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        } else {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
        const textureName = this._getTextureName(textureDef, parameters);
        this._textureImageService.getTextureImage(textureName)
            .then(img => {
                texture.image = img;
                if (uniforms) {
                    uniforms.map.value = texture;
                }
                texture.needsUpdate = true;
            })
            .catch(() => console.error('Texture ' + textureName + ' is not found'));
        return texture;
    }

    _setBlending(materialDef, material) {
        if (materialDef.blending === 'custom') {
            material.blending = THREE.CustomBlending;
            material.blendEquation = THREE.AddEquation;
            if (materialDef.blendSrc) {
                material.blendSrc = BaseMaterialFactory._blendFactorForName(materialDef.blendSrc);
            }
            if (materialDef.blendDst) {
                material.blendDst = BaseMaterialFactory._blendFactorForName(materialDef.blendDst);
            }
        } else if (materialDef.blending === 'additive') {
            material.blending = THREE.AdditiveBlending;
        } else if (materialDef.blending === 'subtractive') {
            material.blending = THREE.SubtractiveBlending;
        } else if (materialDef.blending === 'multiply') {
            material.blending = THREE.MultiplyBlending;
        } else {
            console.error('Unsupported blending: ' + materialDef.blending);
        }
    }

    static _blendFactorForName(name) {
        let propertyName = '';
        const words = name.split('_');
        for (let word of words)
            propertyName += (word.charAt(0).toUpperCase() + word.slice(1));
        propertyName += 'Factor';
        if (THREE[propertyName] !== undefined)
            return THREE[propertyName];
        throw 'Unknown blend factor: ' + name;
    }
}
