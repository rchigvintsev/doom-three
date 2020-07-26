import {AssetLoader} from '../../asset-loader.js';
import {TABLES} from '../../material/tables.js';
import {LightBasicMaterial} from '../../material/light-basic-material.js';
import {TextureImageService} from '../../image/texture-image-service.js';
import {UpdatableMeshBasicMaterial} from '../../material/updatable-mesh-basic-material.js';

const zeroProvider = function () { return 0; };
const oneProvider = function () { return 1; };

export class MaterialBuilder {
    constructor(assetLoader) {
        this._assetLoader = assetLoader;
        this._textureImageService = new TextureImageService(assetLoader);
    }

    clone() {
        return new MaterialBuilder(this._assetLoader);
    }

    build(name, materialDef) {
        const materials = [];

        let material;
        if (materialDef.type === 'basic')
            material = this.newBasicMaterial();
        else if (materialDef.type === 'light_basic')
            material = new LightBasicMaterial();
        else if (materialDef.type === 'shader')
            material = this.newShaderMaterial(name, materialDef);
        else
            material = this.newPhongMaterial();

        material.name = name;

        const updaters = [];
        const updateMixin = {
            update(time) {
                for (let updater of updaters)
                    updater(material, time);
            }
        };
        Object.assign(material, updateMixin);

        materials.push(material);

        if (materialDef.diffuseMap) {
            const diffuseMap = new THREE.Texture();
            if (materialDef.clamp) {
                diffuseMap.wrapS = diffuseMap.wrapT = THREE.ClampToEdgeWrapping;
            } else {
                diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
            }
            material.map = diffuseMap;

            const diffuseMapName = typeof materialDef.diffuseMap === 'string'
                ? materialDef.diffuseMap
                : materialDef.diffuseMap.name;

            this._textureImageService.getTextureImage(diffuseMapName)
                .then(img => {
                    diffuseMap.image = img;
                    if (material.uniforms) {
                        material.uniforms.map.value = diffuseMap;
                    }
                    diffuseMap.needsUpdate = true;
                })
                .catch(() => console.error('Diffuse map ' + diffuseMapName + ' is not found'));
        }

        if (materialDef.normalMap) {
            const normalMap = new THREE.Texture();
            if (materialDef.clamp) {
                normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
            } else {
                normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
            }
            material.normalMap = normalMap;

            const normalMapName = typeof materialDef.normalMap === 'string'
                ? materialDef.normalMap
                : materialDef.normalMap.name;

            this._textureImageService.getTextureImage(normalMapName)
                .then(img => {
                    normalMap.image = img;
                    normalMap.needsUpdate = true;
                })
                .catch(() => console.error('Normal map ' + normalMapName + ' is not found'));
        }

        if (materialDef.specularMap) {
            const specularMap = new THREE.Texture();
            if (materialDef.clamp)
                specularMap.wrapS = specularMap.wrapT = THREE.ClampToEdgeWrapping;
            else
                specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
            material.specularMap = specularMap;

            const specularMapName = typeof materialDef.specularMap === 'string'
                ? materialDef.specularMap
                : materialDef.specularMap.name;

            this._textureImageService.getTextureImage(specularMapName)
                .then(img => {
                    specularMap.image = img;
                    specularMap.needsUpdate = true;
                })
                .catch(() => console.error('Specular map ' + specularMapName + ' is not found'));
        }

        if (materialDef.alphaMap) {
            const alphaMap = new THREE.Texture();
            if (materialDef.clamp)
                alphaMap.wrapS = alphaMap.wrapT = THREE.ClampToEdgeWrapping;
            else
                alphaMap.wrapS = alphaMap.wrapT = THREE.RepeatWrapping;
            material.alphaMap = alphaMap;

            const alphaMapName = typeof materialDef.alphaMap === 'string'
                ? materialDef.alphaMap
                : materialDef.alphaMap.name;

            this._textureImageService.getTextureImage(alphaMapName)
                .then(img => {
                    alphaMap.image = img;
                    alphaMap.needsUpdate = true;
                })
                .catch(() => console.error('Alpha map ' + alphaMapName + ' is not found'))
        }

        if (materialDef.additionalMap) {
            const additionalMap = new THREE.Texture();
            if (materialDef.clamp)
                additionalMap.wrapS = additionalMap.wrapT = THREE.ClampToEdgeWrapping;
            else
                additionalMap.wrapS = additionalMap.wrapT = THREE.RepeatWrapping;
            const additionalMaterial = new THREE.MeshBasicMaterial({transparent: true});
            additionalMaterial.blending = THREE.CustomBlending;
            additionalMaterial.blendEquation = THREE.AddEquation;
            additionalMaterial.blendSrc = THREE.SrcAlphaFactor;
            additionalMaterial.blendDst = THREE.OneMinusSrcColorFactor;
            additionalMaterial.map = additionalMap;
            materials.push(additionalMaterial);

            this._textureImageService.getTextureImage(materialDef.additionalMap)
                .then(img => {
                    additionalMap.image = img;
                    additionalMap.needsUpdate = true;
                })
                .catch(() => console.error('Additional map ' + materialDef.additionalMap + ' is not found'));
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
            if (materialDef.blending === 'custom') {
                material.blending = THREE.CustomBlending;
                material.blendEquation = THREE.AddEquation;
                if (materialDef.blendSrc)
                    material.blendSrc = MaterialBuilder._blendFactorForName(materialDef.blendSrc);
                if (materialDef.blendDst)
                    material.blendDst = MaterialBuilder._blendFactorForName(materialDef.blendDst);
            } else if (materialDef.blending === 'additive')
                material.blending = THREE.AdditiveBlending;
            else if (materialDef.blending === 'subtractive')
                material.blending = THREE.SubtractiveBlending;
            else if (materialDef.blending === 'multiply')
                material.blending = THREE.MultiplyBlending;
            else
                console.error('Unsupported blending: ' + materialDef.blending);
        }

        return materials;
    }

    newBasicMaterial(wireframe) {
        if (wireframe === undefined) {
            wireframe = false;
        }
        return new UpdatableMeshBasicMaterial({wireframe: wireframe});
    }

    newPhongMaterial() {
        return new THREE.MeshPhongMaterial();
    }

    newShaderMaterial(name, definition) {
        const uniforms = {};
        const updaters = [];

        for (let i = 0; i < definition.textures.length; i++) {
            let textureDef = definition.textures[i];
            let textureName;
            if (typeof textureDef === 'string') {
                textureName = textureDef;
            } else {
                textureName = textureDef.name;

                if (textureDef.repeat) {
                    const offsetRepeat = new THREE.Vector4(0, 0, textureDef.repeat[0],
                        textureDef.repeat[1]);
                    uniforms['u_offsetRepeat' + (i + 1)] = {value: offsetRepeat};
                }

                if (textureDef.rotate) {
                    const rotationUniformName = 'u_rotation' + (i + 1);
                    uniforms[rotationUniformName] = {type: 'f', value: 0};

                    const rotateExpr = math.compile(textureDef.rotate);
                    updaters.push((function (rotateExpr, rotationUniformName) {
                        return function (material) {
                            const now = performance.now();
                            const scope = {time: now * 0.01};
                            material.uniforms[rotationUniformName].value = rotateExpr.eval(scope);
                        }
                    })(rotateExpr, rotationUniformName));
                }
            }

            let texture = new THREE.Texture();
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            uniforms['u_texture' + (i + 1)] = {type: 't', value: texture};

            this._textureImageService.getTextureImage(textureName)
                .then(img => {
                    texture.image = img;
                    texture.needsUpdate = true;
                });
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this._assetLoader.assets[AssetLoader.AssetType.SHADERS][name].vertex,
            fragmentShader: this._assetLoader.assets[AssetLoader.AssetType.SHADERS][name].fragment
        });
        if (material.__updaters !== undefined) {
            throw 'Attribute "__updaters" is already defined';
        }
        material.__updaters = updaters;
        return material;
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
            const scope = {time: time * 0.002, table: tableFunc};
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
