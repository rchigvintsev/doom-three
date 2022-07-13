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
    Texture,
    Vector4
} from 'three';

import {compile, EvalFunction} from 'mathjs';

import {GameAssets} from '../game-assets';
import {CustomShaderLib} from '../shader/custom-shader-lib';
import {UpdatableShaderMaterial} from './updatable-shader-material';

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
        if (materialDef.type === 'shader') {
            materials.push(this.createShaderMaterial(materialDef));
        } else {
            materials.push(this.createBasicOrPhongMaterial(materialDef));
        }
        return materials;
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
        const rotationExpressions: EvalFunction[] = [];

        if (materialDef.maps) {
            for (let i = 0; i < materialDef.maps.length; i++) {
                const mapDef = materialDef.maps[i];
                let textureName;
                if (typeof mapDef !== 'string') {
                    textureName = mapDef.name;

                    if (mapDef.repeat) {
                        const offsetRepeat = new Vector4(0, 0, mapDef.repeat[0], mapDef.repeat[1]);
                        uniforms['u_offsetRepeat' + (i + 1)] = {value: offsetRepeat};
                    }

                    if (mapDef.rotate) {
                        uniforms['u_rotation' + (i + 1)] = {value: 0};
                        rotationExpressions[i] = compile(mapDef.rotate);
                    }
                } else {
                    textureName = mapDef;
                }

                const texture = this.getTexture(textureName);
                texture.wrapS = texture.wrapT = RepeatWrapping;
                uniforms['u_texture' + (i + 1)] = {value: texture};
            }
        }

        const material = new UpdatableShaderMaterial({
            uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
        material.rotationExpressions = rotationExpressions;
        this.setTransparency(material, materialDef);
        this.setSide(material, materialDef);
        return material;
    }

    private createBasicOrPhongMaterial(materialDef: any): MeshBasicMaterial | MeshPhongMaterial {
        let material;
        if (materialDef.type === 'basic') {
            material = this.createBasicMaterial();
        } else {
            material = this.createPhongMaterial();
        }
        material.name = materialDef.name;

        if (materialDef.diffuseMap) {
            material.map = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        if (materialDef.normalMap) {
            if (material instanceof MeshPhongMaterial) {
                const mapName = typeof materialDef.normalMap === 'string'
                    ? materialDef.normalMap
                    : materialDef.normalMap.name;
                material.normalMap = this.getTexture(mapName);
                this.setTextureWrapping(material.normalMap, materialDef.clamp);
            } else {
                console.warn(`Definition of material "${materialDef.name}" has unsupported property "normalMap"`);
            }
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
            if (material instanceof MeshPhongMaterial) {
                material.specular = new Color().setHex(materialDef.specular);
            } else {
                console.warn(`Definition of material "${materialDef.name}" has unsupported property "specular"`);
            }
        }

        if (materialDef.shininess) {
            if (material instanceof MeshPhongMaterial) {
                material.shininess = materialDef.shininess;
            } else {
                console.warn(`Definition of material "${materialDef.name}" has unsupported property "shininess"`);
            }
        }

        this.setBlending(material, materialDef);
        this.setSide(material, materialDef);

        if (materialDef.depthWrite) {
            material.depthWrite = materialDef.depthWrite;
        }

        return material;
    }

    private createBasicMaterial(): MeshBasicMaterial {
        return new MeshBasicMaterial();
    }

    private createPhongMaterial(): MeshPhongMaterial {
        return new MeshPhongMaterial();
    }

    private getTexture(textureName: string): Texture {
        const texture = this.assets.textures.get(textureName);
        if (!texture) {
            throw new Error(`Texture "${textureName}" is not found in game assets`);
        }
        return texture.clone();
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
}