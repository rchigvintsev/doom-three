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
    UniformsUtils,
    Vector3
} from 'three';

import {compile} from 'mathjs';

import {GameAssets} from '../game-assets';
import {CustomShaderLib} from '../shader/custom-shader-lib';
import {UpdatableShaderMaterial} from './updatable-shader-material';
import {UpdatableTexture} from '../texture/updatable-texture';
import {Flashlight} from '../entity/md5model/weapon/flashlight';

// noinspection JSMethodCanBeStatic
export class MaterialFactory {
    constructor(private readonly materialDefs: Map<string, any>,
                private readonly assets: GameAssets,
                private readonly flashlight?: Flashlight) {
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

    private createPhongMaterial(materialDef: any): ShaderMaterial {
        const uniforms: any = UniformsUtils.clone(CustomShaderLib.phongFlashlight.uniforms);

        if (this.flashlight) {
            uniforms.flashlight.value.color = new Color().copy(this.flashlight.lightColor);
            uniforms.flashlight.value.color.multiplyScalar(this.flashlight.lightIntensity * Math.PI);
            uniforms.flashlight.value.position = new Vector3();
            uniforms.flashlight.value.direction = new Vector3();
            uniforms.flashlight.value.distance = this.flashlight.lightDistance;
            uniforms.flashlight.value.coneCos = Math.cos(this.flashlight.lightAngle);
            uniforms.flashlight.value.penumbraCos = Math.cos(this.flashlight.lightAngle);
            uniforms.flashlight.value.decay = this.flashlight.lightDecay;
            uniforms.flashlight.value.projectedTexture = this.getTexture('lights/flashlight5');
        }

        const defines: any = {};

        if (materialDef.diffuseMap) {
            uniforms.map.value = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(uniforms.map.value, materialDef.clamp);
            defines.USE_UV = '';
            defines.USE_MAP = '';
        }

        if (materialDef.normalMap) {
            const mapName = typeof materialDef.normalMap === 'string'
                ? materialDef.normalMap
                : materialDef.normalMap.name;
            uniforms.normalMap.value = this.getTexture(mapName);
            this.setTextureWrapping(uniforms.normalMap.value, materialDef.clamp);
            defines.USE_UV = '';
            defines.USE_NORMALMAP = '';
            defines.TANGENTSPACE_NORMALMAP = '';
        }

        if (materialDef.specularMap) {
            uniforms.specularMap.value = this.getTexture(materialDef.specularMap);
            this.setTextureWrapping(uniforms.specularMap.value, materialDef.clamp);
            defines.USE_UV = '';
            defines.USE_SPECULARMAP = '';
        }

        if (materialDef.alphaMap) {
            uniforms.alphaMap.value = this.getTexture(materialDef.alphaMap);
            defines.USE_UV = '';
            defines.USE_ALPHAMAP = '';
        }

        if (materialDef.color) {
            uniforms.diffuse.value.setHex(materialDef.color);
            defines.USE_COLOR = '';
        }

        if (materialDef.alphaTest) {
            uniforms.alphaTest.value = materialDef.alphaTest;
        }

        if (materialDef.specular) {
            uniforms.specular.value.setHex(materialDef.specular);
        }

        if (materialDef.shininess) {
            uniforms.shininess.value = materialDef.shininess;
        }

        const material = new UpdatableShaderMaterial({
            uniforms,
            defines,
            vertexShader: CustomShaderLib.phongFlashlight.vertexShader,
            fragmentShader: CustomShaderLib.phongFlashlight.fragmentShader
        });
        material.name = materialDef.name;
        material.lights = true;
        material.update = () => {
            if (this.flashlight) {
                uniforms.flashlightVisible.value = this.flashlight.visible;
                this.flashlight.updateLightDirection(uniforms.flashlight.value.direction);
                this.flashlight.updateLightTextureProjectionMatrix(uniforms.flashlightTextureProjectionMatrix.value);
            }
        };

        this.setTransparency(material, materialDef);
        this.setSide(material, materialDef);
        this.setDepthWrite(material, materialDef);

        return material;
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

    private setDepthWrite(material: Material, materialDef: any) {
        if (materialDef.depthWrite != undefined) {
            material.depthWrite = materialDef.depthWrite;
        }
    }
}