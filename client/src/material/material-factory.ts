import {
    AdditiveBlending,
    BackSide,
    ClampToEdgeWrapping,
    Color,
    DoubleSide,
    FrontSide,
    IUniform,
    Material,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MultiplyBlending,
    RepeatWrapping,
    ShaderMaterial,
    SubtractiveBlending,
    Texture
} from 'three';

import {compile} from 'mathjs';

import {GameAssets} from '../game-assets';
import {CustomShaderLib} from '../shader/custom-shader-lib';
import {UpdatableShaderMaterial} from './updatable-shader-material';
import {UpdatableTexture} from '../texture/updatable-texture';

// noinspection JSMethodCanBeStatic
export class MaterialFactory {
    constructor(private readonly materialDefs: Map<string, any>, private readonly assets: GameAssets) {
    }

    create(materialName: string): Material[] {
        const materialDef = this.materialDefs.get(materialName);
        if (!materialDef) {
            throw new Error(`Definition of material "${materialName}" is not found`);
        }

        const materials: Material[] = [];
        if (materialDef.type === 'basic') {
            materials.push(this.createBasicMaterial(materialDef));
        } else if (materialDef.type === 'shader') {
            materials.push(this.createShaderMaterial(materialDef));
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
        const material = new MeshBasicMaterial();
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            material.map = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        if (materialDef.specularMap) {
            material.specularMap = this.getTexture(materialDef.specularMap);
            this.setTextureWrapping(material.specularMap, materialDef.clamp);
        }

        if (materialDef.alphaMap) {
            material.alphaMap = this.getTexture(materialDef.alphaMap);
        }

        if (materialDef.color) {
            material.color.setHex(materialDef.color);
        }

        this.setTransparency(material, materialDef);

        if (materialDef.alphaTest) {
            material.alphaTest = materialDef.alphaTest;
        }

        this.setBlending(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);

        return material;
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
                    const texture = new UpdatableTexture();
                    texture.copy(this.getTexture(mapDef.name));
                    texture.wrapS = texture.wrapT = RepeatWrapping;
                    texture.matrixAutoUpdate = false;

                    if (mapDef.repeat) {
                        if (mapDef.repeat.length !== 2) {
                            throw new Error(`Material "${materialDef.name}" has map "${mapDef.name}" with invalid `
                                + `number of repeat values: ${mapDef.repeat.length}`);
                        }
                        texture.repeat.set(mapDef.repeat[0], mapDef.repeat[1]);
                    }

                    if (mapDef.scroll) {
                        if (mapDef.scroll.length !== 2) {
                            throw new Error(`Material "${materialDef.name}" has map "${mapDef.name}" with invalid `
                                + `number of scroll expressions: ${mapDef.scroll.length}`);
                        }
                        texture.setScroll(compile(mapDef.scroll[0]), compile(mapDef.scroll[1]));
                    }

                    if (mapDef.rotate) {
                        texture.rotate = compile(mapDef.rotate);
                    }

                    uniforms['u_map' + (i + 1)] = {value: texture};
                    uniforms[`uv_transform${i + 1}`] = {value: texture.matrix};
                } else {
                    uniforms['u_map' + (i + 1)] = {value: this.getTexture(mapDef)};
                }
            }
        }

        const material = new UpdatableShaderMaterial({
            uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        material.name = materialDef.name;
        this.setTransparency(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);
        return material;
    }

    private createPhongMaterial(materialDef: any): MeshPhongMaterial {
        const material = new MeshPhongMaterial();
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            material.map = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(material.map, materialDef.clamp);
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

        if (materialDef.color) {
            material.color.setHex(materialDef.color);
        }

        this.setTransparency(material, materialDef);

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

        if (materialDef.depthWrite) {
            material.depthWrite = materialDef.depthWrite;
        }

        return material;
    }

    private setTextureWrapping(texture: Texture, clamp: boolean) {
        if (clamp) {
            texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
        } else {
            texture.wrapS = texture.wrapT = RepeatWrapping;
        }
    }

    private setTransparency(material: Material, materialDef: any) {
        if (materialDef.transparent) {
            material.transparent = true;
            if (materialDef.opacity) {
                material.opacity = materialDef.opacity;
            }
        }
    }

    private setBlending(material: MeshBasicMaterial | MeshPhongMaterial, materialDef: any) {
        if (materialDef.blending) {
            if (materialDef.blending === 'additive') {
                material.blending = AdditiveBlending;
            } else if (materialDef.blending === 'subtractive') {
                material.blending = SubtractiveBlending;
            } else if (materialDef.blending === 'multiply') {
                material.blending = MultiplyBlending;
            } else {
                const message = `Definition of material "${materialDef.name}" has property "blending" with unsupported value: ${materialDef.blending}`;
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
}