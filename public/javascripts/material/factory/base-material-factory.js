import {AssetLoader} from '../../asset-loader.js';
import {TABLES} from '../tables.js';
import {LightBasicMaterial} from '../light-basic-material.js';
import {TextureImageService} from '../../image/texture-image-service.js';
import {UpdatableMeshBasicMaterial} from '../updatable-mesh-basic-material.js';
import {UpdatableMeshPhongMaterial} from '../updatable-mesh-phong-material.js';
import {UpdatableShaderMaterial} from '../updatable-shader-material.js';

const zeroProvider = function () { return 0; };
const oneProvider = function () { return 1; };

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

        const updaters = [];
        const updateMixin = {
            update(time) {
                for (let updater of updaters)
                    updater(material, time);
            }
        };
        Object.assign(material, updateMixin);

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

        if (materialDef.children) {
            for (const childDef of materialDef.children) {
                materials = materials.concat(this.create(null, childDef));
            }
        }

        if (materialDef.alphaTest) {
            material.alphaTest = materialDef.alphaTest;
        }

        if (materialDef.color !== undefined) {
            if (materialDef.color.expression)
                updaters.push(this._createScalarColorUpdater(materialDef.color.expression));
            else if (materialDef.color.red && materialDef.color.green && materialDef.color.blue)
                updaters.push(this._createRgbColorUpdater(materialDef.color.red, materialDef.color.green,
                    materialDef.color.blue));
            else
                this._setColor(material, materialDef.color);
        }

        if (materialDef.specular)
            material.specular = new THREE.Color().setHex(materialDef.specular);

        if (materialDef.shininess)
            material.shininess = materialDef.shininess;

        if (materialDef.lightIntensity)
            material.lightIntensity = materialDef.lightIntensity;

        let xRepeat, yRepeat;
        if (materialDef.repeat) {
            const scale = materialDef.scale ? materialDef.scale : [1.0, 1.0];
            xRepeat = this._createRepetitionProvider(materialDef.repeat[0], scale[0]);
            yRepeat = this._createRepetitionProvider(materialDef.repeat[1], scale[1]);
        } else {
            if (!materialDef.scale) {
                xRepeat = yRepeat = oneProvider;
            } else {
                xRepeat = () => materialDef.scale[0];
                yRepeat = () => materialDef.scale[1];
            }
        }

        let xTranslate, yTranslate;
        if (materialDef.translate) {
            xTranslate = this._createTranslationProvider(materialDef.translate[0]);
            yTranslate = this._createTranslationProvider(materialDef.translate[1]);
        } else if (materialDef.scroll) {
            xTranslate = this._createScrollingProvider(materialDef.scroll[0]);
            yTranslate = this._createScrollingProvider(materialDef.scroll[1], yRepeat);
        } else
            xTranslate = yTranslate = zeroProvider;

        let rotate;
        if (materialDef.rotate)
            rotate = this._createRotationProvider(materialDef.rotate);
        else
            rotate = zeroProvider;

        if (material.map) {
            material.map.matrixAutoUpdate = false;
            if (material.normalMap) {
                material.normalMap.matrixAutoUpdate = false;
            }
            if (material.specularMap) {
                material.specularMap.matrixAutoUpdate = false;
            }
            if (material.alphaMap) {
                material.alphaMap.matrixAutoUpdate = false;
            }
            updaters.push(this._createTransformUpdater(xRepeat, yRepeat, rotate, xTranslate, yTranslate,
                materialDef.center));
        }

        if (materialDef.side === 'double')
            material.side = THREE.DoubleSide;
        else if (materialDef.side === 'front')
            material.side = THREE.FrontSide;
        else
            material.side = THREE.BackSide;

        if (materialDef.transparent) {
            material.transparent = true;
            if (materialDef.opacity !== undefined)
                if (materialDef.opacity.expression)
                    updaters.push(this._createOpacityUpdater(materialDef.opacity.expression));
                else
                    this._setOpacity(material, materialDef.opacity);
        }

        if (materialDef.depthWrite !== undefined)
            material.depthWrite = materialDef.depthWrite;

        if (materialDef.blending) {
            this._setBlending(materialDef, material);
        }

        return materials;
    }

    _createMaterial(name, materialDef) {
        let material;
        if (materialDef.type === 'basic') {
            material = this._createBasicMaterial();
        } else if (materialDef.type === 'light_basic') {
            material = this._createLightBasicMaterial();
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

    _createScalarColorUpdater(expression) {
        const compiledExpression = math.compile(expression);
        const tableFunc = function (tableName, value) {
            const table = TABLES[tableName];
            const val = value % table.values.length;
            let floor = Math.floor(val);
            let ceil = Math.ceil(val);
            if (ceil >= table.values.length)
                ceil = 0;
            const floorColor = table.values[floor];
            const ceilColor = table.values[ceil];
            return floorColor + (val - floor) * 100 * ((ceilColor - floorColor) / 100);
        };
        return function (material, time) {
            const scope = {time: time * 0.0025, table: tableFunc};
            material.color.setScalar(compiledExpression.eval(scope));
        };
    }

    _createRgbColorUpdater(red, green, blue) {
        const compiledRedExpr = math.compile(red.expression);
        const compiledGreenExpr = math.compile(green.expression);
        const compiledBlueExpr = math.compile(blue.expression);

        const tableFunc = function (tableName, value) {
            const table = TABLES[tableName];
            const val = value % table.values.length;
            let floor = Math.floor(val);
            let ceil = Math.ceil(val);
            if (ceil >= table.values.length)
                ceil = 0;
            const floorColor = table.values[floor];
            const ceilColor = table.values[ceil];
            return floorColor + (val - floor) * 100 * ((ceilColor - floorColor) / 100);
        };

        return function (material, time) {
            const scope = {time: time * 0.0025, table: tableFunc};
            const redColor = compiledRedExpr.eval(scope);
            const greenColor = compiledGreenExpr.eval(scope);
            const blueColor = compiledBlueExpr.eval(scope);
            material.color.setRGB(redColor, greenColor, blueColor);
        };
    }

    _createTransformUpdater(xRepeat, yRepeat, rotate, xTranslate, yTranslate, center) {
        if (!center) {
            center = [0.5, 0.5];
        }

        return (material, time) => {
            if (!time) {
                return;
            }

            if (material.map.image) {
                const updatedMatrix = material.map.matrix.identity()
                    .scale(xRepeat(time), yRepeat(time))
                    .translate(-center[0], -center[1])
                    .rotate(rotate(time))
                    .translate(center[0], center[1])
                    .translate(xTranslate(time), yTranslate(time));

                material.map.matrix.copy(updatedMatrix);

                if (material.normalMap && material.normalMap.image) {
                    material.normalMap.matrix.copy(updatedMatrix);
                }

                if (material.specularMap && material.specularMap.image) {
                    material.specularMap.matrix.copy(updatedMatrix);
                }

                if (material.alphaMap && material.alphaMap.image) {
                    material.alphaMap.matrix.copy(updatedMatrix);
                }
            }
        };
    }

    _createOpacityUpdater(expression) {
        const compiledExpression = math.compile(expression);
        const tableFunc = function (tableName, value) {
            const table = TABLES[tableName];
            const v = value % table.values.length;
            let floor = Math.floor(v);
            let ceil = Math.ceil(v);
            if (ceil >= table.values.length)
                ceil = 0;
            const floorOpacity = table.values[floor];
            const ceilOpacity = table.values[ceil];
            return floorOpacity + (v - floor) * 100 * ((ceilOpacity - floorOpacity) / 100);
        };
        return function (material, time) {
            const scope = {time: time * 0.01, table: tableFunc};
            material.opacity = compiledExpression.eval(scope);
        };
    }

    _createRepetitionProvider(repeat, scale=1.0) {
        if (repeat.expression) {
            const compiledExpression = math.compile(repeat.expression);
            const tableFunc = function (tableName, value) {
                const table = TABLES[tableName];
                const val = value % table.values.length;
                let floor = Math.floor(val);
                let ceil = Math.ceil(val);
                if (ceil >= table.values.length)
                    ceil = 0;
                const floorRepeat = table.values[floor];
                const ceilRepeat = table.values[ceil];
                return floorRepeat + (val - floor) * 100 * ((ceilRepeat - floorRepeat) / 100);
            };
            return function (time) {
                const scope = {time: time * 0.004, table: tableFunc};
                return compiledExpression.eval(scope) * scale;
            };
        }

        return function () {
            return repeat;
        };
    }

    _createTranslationProvider(expression) {
        const compiledExpression = math.compile(expression);
        const tableFunc = function (tableName, value) {
            const table = TABLES[tableName];
            const v = value % table.values.length;
            if (!table.snap) {
                let floor = Math.floor(v);
                let ceil = Math.ceil(v);
                if (ceil >= table.values.length)
                    ceil = 0;
                const floorTranslation = table.values[floor];
                const ceilTranslation = table.values[ceil];
                return floorTranslation + (v - floor) * 100 * ((ceilTranslation - floorTranslation) / 100);
            }
            return table.values[Math.floor(v)];
        };
        return function(time) {
            const scope = {time: time * 0.001, table: tableFunc};
            return compiledExpression.eval(scope);
        };
    }

    _createScrollingProvider(scroll, timeModifier) {
        const expression = math.compile(scroll);
        return function (time) {
            if (timeModifier)
                time *= timeModifier(time);
            const scope = {time: time * 0.001};
            return expression.eval(scope);
        };
    }

    _createRotationProvider(rotate) {
        const expression = math.compile(rotate);
        return function (time) {
            const scope = {time: time * 0.0075};
            return expression.eval(scope) * -1;
        }
    }

    _setColor(material, color) {
        material.color.setHex(color);
    }

    _setOpacity(material, opacity) {
        material.opacity = opacity;
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
