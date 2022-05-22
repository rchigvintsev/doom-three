import {
    AdditiveBlending,
    BackSide,
    ClampToEdgeWrapping,
    Color,
    DoubleSide,
    FrontSide,
    Material,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MultiplyBlending,
    RepeatWrapping,
    SubtractiveBlending,
    Texture
} from 'three';
import {GameAssets} from '../game-assets';

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

        const material = this.createMaterial(materialDef);
        materials.push(material);

        if (materialDef.diffuseMap) {
            material.map = this.getTexture(materialDef.diffuseMap);
            this.setTextureWrapping(material.map, materialDef.clamp);
        }

        if (materialDef.normalMap) {
            if (material instanceof MeshPhongMaterial) {
                material.normalMap = this.getTexture(materialDef.normalMap);
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

        if (materialDef.transparent) {
            material.transparent = true;
            if (materialDef.opacity) {
                material.opacity = materialDef.opacity;
            }
        }

        if (materialDef.alphaTest != null) {
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
                material.shininess = materialDef.specular;
            } else {
                console.warn(`Definition of material "${materialDef.name}" has unsupported property "shininess"`);
            }
        }

        this.setBlending(material, materialDef);
        this.setSide(material, materialDef);

        if (materialDef.depthWrite) {
            material.depthWrite = materialDef.depthWrite;
        }

        return materials;
    }

    private createMaterial(materialDef: any): MeshBasicMaterial | MeshPhongMaterial {
        let material;
        if (materialDef.type === 'basic') {
            material = this.createBasicMaterial();
        } else {
            material = this.createPhongMaterial();
        }
        material.name = materialDef.name;
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

    private setSide(material: MeshBasicMaterial | MeshPhongMaterial, materialDef: any) {
        if (materialDef.side === 'double') {
            material.side = DoubleSide;
        } else if (materialDef.side === 'front') {
            material.side = FrontSide;
        } else {
            material.side = BackSide;
        }
    }
}