import {
    AdditiveBlending,
    BackSide,
    ClampToEdgeWrapping,
    Color,
    CustomBlending,
    DoubleSide,
    FrontSide,
    IUniform,
    Material,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MultiplyBlending,
    RepeatWrapping,
    ShaderMaterial,
    SpriteMaterial,
    SubtractiveBlending,
    Texture
} from 'three';
import {OneMinusSrcColorFactor, ZeroFactor} from 'three/src/constants';

import {compile} from 'mathjs';
import {inject, injectable} from 'inversify';
import 'reflect-metadata';

import {GameAssets} from '../game-assets';
import {CustomShaderLib} from '../shader/custom-shader-lib';
import {UpdatableShaderMaterial} from './updatable-shader-material';
import {UpdatableTexture} from '../texture/updatable-texture';
import {UpdatableMeshBasicMaterial} from './updatable-mesh-basic-material';
import {UpdatableMaterial} from './updatable-material';
import {UpdatableSpriteMaterial} from './updatable-sprite-material';
import {UpdatableMeshPhongMaterial} from './updatable-mesh-phong-material';
import {parseMaterialKind} from './material-kind';
import {TYPES} from '../types';

@injectable()
export class MaterialFactory {
    private readonly evalScope: any;

    constructor(@inject(TYPES.Assets) private readonly assets: GameAssets) {
        this.evalScope = this.createExpressionEvaluationScope(assets.tableDefs);
    }

    create(materialName: any): Material[] {
        let materialDef;
        if (typeof materialName === 'string') {
            materialDef = this.assets.materialDefs.get(materialName);
            if (!materialDef) {
                throw new Error(`Definition of material "${materialName}" is not found`);
            }
        } else {
            materialDef = materialName;
        }

        const materials: Material[] = [];
        if (materialDef.type === 'basic') {
            materials.push(this.createBasicMaterial(materialDef));
        } else if (materialDef.type === 'shader') {
            materials.push(this.createShaderMaterial(materialDef));
        } else if (materialDef.type === 'sprite') {
            materials.push(this.createSpriteMaterial(materialDef));
        } else {
            materials.push(this.createPhongMaterial(materialDef));
        }
        return materials;
    }

    getTexture(textureName: string): Texture {
        const texture = this.assets.textures.get(textureName);
        if (!texture) {
            throw new Error(`Texture "${textureName}" is not found in game assets`);
        }
        return texture.clone();
    }

    private createBasicMaterial(materialDef: any): MeshBasicMaterial {
        const material = new UpdatableMeshBasicMaterial({}, {
            kind: parseMaterialKind(materialDef.kind),
            evalScope: this.evalScope
        });
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            if (typeof materialDef.diffuseMap !== 'string') {
                material.map = this.createUpdatableMap(materialDef.name, materialDef.diffuseMap);
            } else {
                material.map = this.getTexture(materialDef.diffuseMap);
            }
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        if (materialDef.specularMap) {
            if (typeof materialDef.specularMap !== 'string') {
                material.specularMap = this.createUpdatableMap(materialDef.name, materialDef.specularMap);
            } else {
                material.specularMap = this.getTexture(materialDef.specularMap);
            }
            this.setTextureWrapping(material.specularMap, materialDef.clamp);
        }

        if (materialDef.alphaMap) {
            if (typeof materialDef.alphaMap !== 'string') {
                material.alphaMap = this.createUpdatableMap(materialDef.name, materialDef.alphaMap);
            } else {
                material.alphaMap = this.getTexture(materialDef.alphaMap);
            }
            this.setTextureWrapping(material.alphaMap, materialDef.clamp);
        } else if (materialDef.transparent) {
            material.alphaMap = material.map;
        }

        this.setColor(material, materialDef);
        this.setTransparency(material, materialDef);
        this.setPolygonOffset(material, materialDef);

        if (materialDef.alphaTest) {
            material.alphaTest = materialDef.alphaTest;
        }

        this.setBlending(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);
        this.setDepthTest(material, materialDef);

        return material;
    }

    private createExpressionEvaluationScope(tables: Map<string, any>): any {
        const evalScope: any = {};
        tables.forEach((table, name) => {
            /*
             * Based on the code from DeclTable.cpp file that can be found in DOOM 3 GitHub repository
             * (https://github.com/id-Software/DOOM-3).
             */
            evalScope[name] = (deltaTime: number) => {
                deltaTime *= table.values.length;
                let index = Math.floor(deltaTime);
                const frac = deltaTime - index;
                index %= table.values.length;
                if (!table.snap) {
                    const val = table.values[index] * (1.0 - frac);
                    if (index < table.values.length - 1) {
                        return val + table.values[index + 1] * frac;
                    }
                    return val + table.values[0] * frac;
                }
                return table.values[index];
            };
        });
        return evalScope;
    }

    private createShaderMaterial(materialDef: any): ShaderMaterial {
        if (!materialDef.shader) {
            throw new Error(`Shader name is not specified for material "${materialDef.name}"`);
        }
        const shader = CustomShaderLib[materialDef.shader];
        if (!shader) {
            throw new Error(`Shader "${materialDef.shader}" is not found`);
        }

        const uniforms: { [uniform: string]: IUniform } = {};

        if (materialDef.maps) {
            for (let i = 0; i < materialDef.maps.length; i++) {
                const mapDef = materialDef.maps[i];
                if (typeof mapDef !== 'string') {
                    const map = this.createUpdatableMap(materialDef.name, mapDef);
                    this.setTextureWrapping(map, false);
                    uniforms['u_map' + (i + 1)] = {value: map};
                    uniforms[`uv_transform${i + 1}`] = {value: map.matrix};
                } else {
                    uniforms['u_map' + (i + 1)] = {value: this.getTexture(mapDef)};
                }
            }
        }

        const material = new UpdatableShaderMaterial({
            uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        }, {
            kind: parseMaterialKind(materialDef.kind),
            evalScope: this.evalScope
        });
        material.name = materialDef.name;
        this.setTransparency(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);
        this.setDepthTest(material, materialDef);
        return material;
    }

    private createSpriteMaterial(materialDef: any): SpriteMaterial {
        const material = new UpdatableSpriteMaterial({}, {
            kind: parseMaterialKind(materialDef.kind),
            evalScope: this.evalScope
        });
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            if (typeof materialDef.diffuseMap !== 'string') {
                material.map = this.createUpdatableMap(materialDef.name, materialDef.diffuseMap);
            } else {
                material.map = this.getTexture(materialDef.diffuseMap);
            }
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        this.setColor(material, materialDef);
        this.setTransparency(material, materialDef);
        this.setBlending(material, materialDef);
        this.setDepthWrite(material, materialDef);
        this.setDepthTest(material, materialDef);

        return material;
    }

    private createPhongMaterial(materialDef: any): MeshPhongMaterial {
        const material = new UpdatableMeshPhongMaterial({}, {
            kind: parseMaterialKind(materialDef.kind),
            evalScope: this.evalScope
        });
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            material.map = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        if (materialDef.bumpMap) {
            const mapName = typeof materialDef.bumpMap === 'string'
                ? materialDef.bumpMap
                : materialDef.bumpMap.name;
            material.bumpMap = this.getTexture(mapName);
            this.setTextureWrapping(material.bumpMap, materialDef.clamp);
        }

        if (materialDef.normalMap) {
            const mapName = typeof materialDef.normalMap === 'string'
                ? materialDef.normalMap
                : materialDef.normalMap.name;
            material.normalMap = this.getTexture(mapName);
            this.setTextureWrapping(material.normalMap, materialDef.clamp);
        }

        if (materialDef.specularMap) {
            material.specularMap = this.getTexture(materialDef.specularMap);
            this.setTextureWrapping(material.specularMap, materialDef.clamp);
        }

        if (materialDef.alphaMap) {
            material.alphaMap = this.getTexture(materialDef.alphaMap);
        }

        this.setColor(material, materialDef);
        this.setTransparency(material, materialDef);
        this.setPolygonOffset(material, materialDef);

        if (materialDef.alphaTest) {
            material.alphaTest = materialDef.alphaTest;
        }

        if (materialDef.specular) {
            material.specular = new Color().setHex(materialDef.specular);
        }

        if (materialDef.shininess) {
            material.shininess = materialDef.shininess;
        }

        this.setBlending(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);
        this.setDepthTest(material, materialDef);

        if (materialDef.depthWrite) {
            material.depthWrite = materialDef.depthWrite;
        }

        return material;
    }

    private createUpdatableMap(materialName: string, mapDef: any): UpdatableTexture {
        const texture = new UpdatableTexture(this.evalScope);
        texture.copy(this.getTexture(mapDef.name));
        texture.matrixAutoUpdate = false;

        this.setTextureRepeat(materialName, texture, mapDef);

        if (mapDef.scroll) {
            if (mapDef.scroll.length !== 2) {
                throw new Error(`Material "${materialName}" has map "${mapDef.name}" with invalid `
                    + `number of scroll expressions: ${mapDef.scroll.length}`);
            }
            const scrollX = typeof mapDef.scroll[0] === 'number' ? mapDef.scroll[0] : compile(mapDef.scroll[0]);
            const scrollY = typeof mapDef.scroll[1] === 'number' ? mapDef.scroll[1] : compile(mapDef.scroll[1]);
            texture.setScroll(scrollX, scrollY);
        }

        if (mapDef.rotate) {
            texture.rotate = compile(mapDef.rotate);
        }

        this.setTextureCenter(materialName, texture, mapDef);

        return texture;
    }

    private setTextureRepeat(materialName: string, texture: Texture, mapDef: any) {
        if (mapDef.repeat) {
            if (mapDef.repeat.length !== 2) {
                throw new Error(`Material "${materialName}" has map "${mapDef.name}" with invalid `
                    + `number of repeat values: ${mapDef.repeat.length}`);
            }
            texture.repeat.set(mapDef.repeat[0], mapDef.repeat[1]);
        }
    }

    private setTextureCenter(materialName: string, texture: Texture, mapDef: any) {
        if (mapDef.center) {
            if (mapDef.scroll.length !== 2) {
                throw new Error(`Material "${materialName}" has map "${mapDef.name}" with invalid `
                    + `number of center values: ${mapDef.center.length}`);
            }
            texture.center.set(mapDef.center[0], mapDef.center[1]);
        }
    }

    private setTextureWrapping(texture: Texture, clamp: boolean) {
        if (clamp) {
            texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
        } else {
            texture.wrapS = texture.wrapT = RepeatWrapping;
        }
    }

    private setColor(material: MeshBasicMaterial | MeshPhongMaterial | SpriteMaterial, materialDef: any) {
        if (materialDef.color) {
            material.color.setHex(materialDef.color);
        }
    }

    private setTransparency(material: UpdatableMaterial, materialDef: any) {
        if (materialDef.transparent) {
            material.transparent = true;
            if (materialDef.opacity) {
                if (typeof materialDef.opacity === 'string') {
                    material.opacityExpression = compile(materialDef.opacity);
                } else {
                    material.opacity = materialDef.opacity;
                }
            }
        }
    }

    private setPolygonOffset(material: Material, materialDef: any) {
        if (materialDef.polygonOffset) {
            material.polygonOffset = true;
            if (materialDef.polygonOffsetFactor != undefined) {
                material.polygonOffsetFactor = materialDef.polygonOffsetFactor;
            }
        }
    }

    private setBlending(material: Material, materialDef: any) {
        if (materialDef.blending) {
            if (materialDef.blending === 'additive') {
                material.blending = AdditiveBlending;
            } else if (materialDef.blending === 'subtractive') {
                material.blending = SubtractiveBlending;
            } else if (materialDef.blending === 'multiply') {
                material.blending = MultiplyBlending;
            } else if (materialDef.blending === 'custom') {
                material.blending = CustomBlending;
                if (materialDef.blendSrc === 'gl_zero') {
                    material.blendSrc = ZeroFactor;
                }
                if (materialDef.blendDst === 'gl_one_minus_src_color') {
                    material.blendDst = OneMinusSrcColorFactor;
                }
            } else {
                const message = `Definition of material "${materialDef.name}" has property "blending" with `
                    + `unsupported value: ${materialDef.blending}`;
                console.error(message);
            }
        }
    }

    private setSide(material: Material, materialDef: any) {
        if (materialDef.side === 'double') {
            material.side = DoubleSide;
        } else if (materialDef.side === 'front') {
            material.side = FrontSide;
        } else {
            material.side = BackSide;
        }
    }

    private setDepthWrite(material: Material, materialDef: any) {
        if (materialDef.depthWrite != undefined) {
            material.depthWrite = materialDef.depthWrite;
        }
    }

    private setDepthTest(material: Material, materialDef: any) {
        if (materialDef.depthTest != undefined) {
            material.depthTest = materialDef.depthTest;
        }
    }
}
