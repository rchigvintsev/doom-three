import {AssetLoader} from '../../asset-loader.js';
import {TABLES} from '../../material/tables.js';

const zeroProvider = function () { return 0; };
const oneProvider = function () { return 1; };
const noOpUpdater = function () {};

export class MaterialBuilder {
    constructor(assets) {
        this._assets = assets;
    }

    clone() {
        return new MaterialBuilder(this._assets);
    }

    build(name, definition) {
        const materials = [];

        let material;
        if (definition.type === 'basic')
            material = this.newBasicMaterial();
        else if (definition.type === 'shader')
            material = this.newShaderMaterial(name, definition);
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

        if (definition.diffuseMap) {
            const diffuseMapName = typeof definition.diffuseMap === 'string' ? definition.diffuseMap
                : definition.diffuseMap.name;
            let diffuseMap = this._assets[AssetLoader.AssetType.TEXTURES][diffuseMapName];
            if (!diffuseMap)
                console.error('Diffuse map ' + diffuseMapName + ' is not found');
            else {
                if (definition.clamp)
                    diffuseMap.wrapS = diffuseMap.wrapT = THREE.ClampToEdgeWrapping;
                else
                    diffuseMap.wrapS = diffuseMap.wrapT = THREE.RepeatWrapping;
                material.map = diffuseMap;
            }
        }

        if (definition.normalMap) {
            const normalMapName = typeof definition.normalMap === 'string' ? definition.normalMap
                : definition.normalMap.name;
            let normalMap = this._assets[AssetLoader.AssetType.TEXTURES][normalMapName];
            if (!normalMap)
                console.error('Normal map ' + normalMapName + ' is not found');
            else {
                if (definition.clamp)
                    normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
                else
                    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
                material.normalMap = normalMap;
            }
        }

        if (definition.specularMap) {
            const specularMapName = typeof definition.specularMap === 'string' ? definition.specularMap
                : definition.specularMap.name;
            let specularMap = this._assets[AssetLoader.AssetType.TEXTURES][specularMapName];
            if (!specularMap)
                console.error('Specular map ' + specularMapName + ' is not found');
            else {
                if (definition.clamp)
                    specularMap.wrapS = specularMap.wrapT = THREE.ClampToEdgeWrapping;
                else
                    specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;
                material.specularMap = specularMap;
            }
        }

        if (definition.alphaMap) {
            let alphaMap = this._assets[AssetLoader.AssetType.TEXTURES][definition.alphaMap];
            if (!alphaMap)
                console.error('Alpha map ' + definition.alphaMap + ' is not found');
            else {
                if (definition.clamp)
                    alphaMap.wrapS = alphaMap.wrapT = THREE.ClampToEdgeWrapping;
                else
                    alphaMap.wrapS = alphaMap.wrapT = THREE.RepeatWrapping;
                material.alphaMap = alphaMap;
            }
        }

        if (definition.additionalMap) {
            let additionalMap = this._assets[AssetLoader.AssetType.TEXTURES][definition.additionalMap];
            if (!additionalMap)
                console.error('Additional map ' + definition.additionalMap + ' is not found');
            else {
                if (definition.clamp)
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
            }
        }

        if (definition.color !== undefined) {
            if (definition.color.expression)
                updaters.push(this._createScalarColorUpdater(definition.color.expression));
            else if (definition.color.red && definition.color.green && definition.color.blue)
                updaters.push(this._createRgbColorUpdater(definition.color.red, definition.color.green,
                    definition.color.blue));
            else
                this._setColor(material, definition.color);
        }

        if (definition.specular)
            material.specular = new THREE.Color().setHex(definition.specular);

        if (definition.shininess)
            material.shininess = definition.shininess;

        let xRepeat, yRepeat;
        if (definition.repeat) {
            xRepeat = this._createRepetitionProvider(definition.repeat[0]);
            yRepeat = this._createRepetitionProvider(definition.repeat[1]);
        } else
            xRepeat = yRepeat = oneProvider;

        let xTranslate, yTranslate;
        if (definition.translate) {
            xTranslate = this._createTranslationProvider(definition.translate[0]);
            yTranslate = this._createTranslationProvider(definition.translate[1]);
        } else if (definition.scroll) {
            xTranslate = this._createScrollingProvider(definition.scroll[0]);
            yTranslate = this._createScrollingProvider(definition.scroll[1], yRepeat);
        } else
            xTranslate = yTranslate = zeroProvider;

        let rotate;
        if (definition.rotate)
            rotate = this._createRotationProvider(definition.rotate);
        else
            rotate = zeroProvider;

        updaters.push(this._createTransformUpdater(xRepeat, yRepeat, rotate, xTranslate, yTranslate,
            definition.center));

        if (definition.side === 'double')
            material.side = THREE.DoubleSide;
        else if (definition.side === 'front')
            material.side = THREE.FrontSide;
        else
            material.side = THREE.BackSide;

        if (definition.transparent) {
            material.transparent = true;
            if (definition.opacity !== undefined)
                if (definition.opacity.expression)
                    updaters.push(this._createOpacityUpdater(definition.opacity.expression));
                else
                    this._setOpacity(material, definition.opacity);
        }

        if (definition.depthWrite !== undefined)
            material.depthWrite = definition.depthWrite;

        if (definition.blending) {
            if (definition.blending === 'custom') {
                material.blending = THREE.CustomBlending;
                material.blendEquation = THREE.AddEquation;

                if (definition.blendSrc === 'dst_color')
                    material.blendSrc = THREE.DstColorFactor;
                else if (definition.blendSrc === 'src_alpha')
                    material.blendSrc = THREE.SrcAlphaFactor;
                else
                    material.blendSrc = THREE.ZeroFactor;

                if (definition.blendDst === 'one_minus_src_color')
                    material.blendDst = THREE.OneMinusSrcColorFactor;
                else if (definition.blendDst === 'one_minus_src_alpha')
                    material.blendDst = THREE.OneMinusSrcAlphaFactor;
                else
                    material.blendDst = THREE.ZeroFactor;
            } else if (definition.blending === 'additive')
                material.blending = THREE.AdditiveBlending;
            else
                console.error('Unsupported blending: ' + definition.blending);
        }

        return materials.length === 1 ? material : materials;
    }

    newBasicMaterial(wireframe) {
        if (wireframe === undefined)
            wireframe = false;
        return new THREE.MeshBasicMaterial({wireframe: wireframe});
    }

    newPhongMaterial() {
        return new THREE.MeshPhongMaterial();
    }

    newShaderMaterial(name, definition) {
        const uniforms = {};
        const updaters = [];

        for (let i = 0; i < definition.textures.length; i++) {
            let textureDefinition = definition.textures[i];
            let texture;

            if (typeof textureDefinition === 'string')
                texture = this._assets[AssetLoader.AssetType.TEXTURES][textureDefinition];
            else {
                texture = this._assets[AssetLoader.AssetType.TEXTURES][textureDefinition.name];

                if (textureDefinition.repeat) {
                    const offsetRepeat = new THREE.Vector4(0, 0, textureDefinition.repeat[0],
                        textureDefinition.repeat[1]);
                    uniforms['u_offsetRepeat' + (i + 1)] = {value: offsetRepeat};
                }

                if (textureDefinition.rotate) {
                    const rotationUniformName = 'u_rotation' + (i + 1);
                    uniforms[rotationUniformName] = {type: 'f', value: 0};

                    const rotateExpr = math.compile(textureDefinition.rotate);
                    updaters.push((function (rotateExpr, rotationUniformName) {
                        return function (material) {
                            const now = performance.now();
                            const scope = {time: now * 0.01};
                            material.uniforms[rotationUniformName].value = rotateExpr.eval(scope);
                        }
                    })(rotateExpr, rotationUniformName));
                }
            }

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            uniforms['u_texture' + (i + 1)] = {type: 't', value: texture};
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: this._assets[AssetLoader.AssetType.SHADERS][name].vertex,
            fragmentShader: this._assets[AssetLoader.AssetType.SHADERS][name].fragment
        });
        if (material.__updaters !== undefined)
            throw 'Attribute "__updaters" is already defined';
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

    _createTransformUpdater() {
        return noOpUpdater;
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

    _createRepetitionProvider(repeat) {
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
                return compiledExpression.eval(scope);
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
}
