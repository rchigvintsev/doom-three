import {
    AdditiveBlending,
    AnimationClip,
    BackSide, BufferGeometry,
    Color,
    CustomBlending,
    DoubleSide,
    FileLoader,
    Loader,
    LoaderUtils,
    LoadingManager,
    Material,
    MaterialLoader,
    MirroredRepeatWrapping,
    MultiplyBlending,
    NoBlending,
    NormalBlending,
    RepeatWrapping,
    SubtractiveBlending,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4
} from 'three';
import {Face3, Geometry} from "three/examples/jsm/deprecated/Geometry";
import {generateUUID} from "three/src/math/MathUtils";

const BlendingMode = {
    NoBlending: NoBlending,
    NormalBlending: NormalBlending,
    AdditiveBlending: AdditiveBlending,
    SubtractiveBlending: SubtractiveBlending,
    MultiplyBlending: MultiplyBlending,
    CustomBlending: CustomBlending
};

const FaceColors = 1;
const VertexColors = 2;

/**
 * Resurrected Three.js loader originally written by "mrdoob" (http://mrdoob.com/) and
 * "alteredq" (http://alteredqualia.com/).
 */
export class JsonLoader extends Loader {
    private readonly fileLoader: FileLoader;
    private readonly textureLoader: TextureLoader;
    private readonly materialLoader: MaterialLoader;

    private texturePath?: string;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(this.manager);
        this.textureLoader = new TextureLoader(this.manager);
        this.materialLoader = new MaterialLoader(this.manager);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<any[]> {
        const texturePath = this.texturePath ? this.texturePath : LoaderUtils.extractUrlBase(url);
        this.fileLoader.setWithCredentials(this.withCredentials);
        return this.fileLoader.loadAsync(url, onProgress).then(content => {
            const json = JSON.parse(<string>content);
            const metadata = json.metadata;
            if (metadata) {
                const type = metadata.type;
                if (type) {
                    if (type.toLowerCase() === 'object') {
                        throw new Error(`"Resource ${url}" should be loaded with ObjectLoader instead of JsonLoader`);
                    }
                }
            }

            const object = this.parse(json, texturePath);
            return [object.geometry, object.materials];
        });
    }

    parse(json: any, texturePath?: string): { geometry: BufferGeometry; materials?: Material[] } {
        if (json.data) {
            // Geometry 4.0 spec
            json = json.data;
        }

        if (json.scale) {
            json.scale = 1.0 / json.scale;
        } else {
            json.scale = 1.0;
        }

        const geometry = new Geometry();

        this.parseModel(json, geometry);
        this.parseSkin(json, geometry);
        this.parseMorphing(json, geometry);
        this.parseAnimations(json, geometry);

        geometry.computeFaceNormals();
        geometry.computeBoundingSphere();

        if (json.materials == null || json.materials.length === 0) {
            return {geometry: geometry.toBufferGeometry()};
        } else {
            const materials = this.initMaterials(json.materials, texturePath, this.crossOrigin);
            return {geometry: geometry.toBufferGeometry(), materials};
        }
    }

    private isBitSet(value: any, position: number): boolean {
        return (value & (1 << position)) !== 0;
    }

    private flatArrayToVector4Array(src: number[], dst: Vector4[], step: number) {
        for (let i = 0, l = src.length; i < l; i += step) {
            const x = src[i];
            const y = step > 1 ? src[i + 1] : 0;
            const z = step > 2 ? src[i + 2] : 0;
            const w = step > 3 ? src[i + 3] : 0;
            dst.push(new Vector4(x, y, z, w));
        }
    }

    private parseModel(json: any, geometry: Geometry) {
        let i, j, fi,

            offset, zLength,

            colorIndex, normalIndex, uvIndex, materialIndex,

            type,
            isQuad,
            hasMaterial,
            hasFaceVertexUv,
            hasFaceNormal, hasFaceVertexNormal,
            hasFaceColor, hasFaceVertexColor,

            vertex, face, faceA, faceB, hex, normal,

            uvLayer, uv, u, v,

            nUvLayers = 0;

        const faces = json.faces,
            vertices = json.vertices,
            normals = json.normals,
            colors = json.colors,

            scale = json.scale;

        if (json.uvs != null) {
            // Disregard empty arrays
            for (i = 0; i < json.uvs.length; i++) {
                if (json.uvs[i].length) {
                    nUvLayers++;
                }
            }

            for (i = 0; i < nUvLayers; i++) {
                geometry.faceVertexUvs[i] = [];
            }
        }

        offset = 0;
        zLength = vertices.length;

        while (offset < zLength) {
            vertex = new Vector3();

            vertex.x = vertices[offset++] * scale;
            vertex.y = vertices[offset++] * scale;
            vertex.z = vertices[offset++] * scale;

            geometry.vertices.push(vertex);
        }

        offset = 0;
        zLength = faces.length;

        while (offset < zLength) {
            type = faces[offset++];

            isQuad = this.isBitSet(type, 0);
            hasMaterial = this.isBitSet(type, 1);
            hasFaceVertexUv = this.isBitSet(type, 3);
            hasFaceNormal = this.isBitSet(type, 4);
            hasFaceVertexNormal = this.isBitSet(type, 5);
            hasFaceColor = this.isBitSet(type, 6);
            hasFaceVertexColor = this.isBitSet(type, 7);

            if (isQuad) {
                faceA = new Face3(faces[offset], faces[offset + 1], faces[offset + 3]);
                faceB = new Face3(faces[offset + 1], faces[offset + 2], faces[offset + 3]);

                offset += 4;

                if (hasMaterial) {
                    materialIndex = faces[offset++];
                    faceA.materialIndex = materialIndex;
                    faceB.materialIndex = materialIndex;
                }

                // To get face <=> uv index correspondence
                fi = geometry.faces.length;

                if (hasFaceVertexUv) {
                    for (i = 0; i < nUvLayers; i++) {
                        uvLayer = json.uvs[i];

                        geometry.faceVertexUvs[i][fi] = [];
                        geometry.faceVertexUvs[i][fi + 1] = [];

                        for (j = 0; j < 4; j++) {
                            uvIndex = faces[offset++];

                            u = uvLayer[uvIndex * 2];
                            v = uvLayer[uvIndex * 2 + 1];

                            uv = new Vector2(u, v);

                            if (j !== 2) geometry.faceVertexUvs[i][fi].push(uv);
                            if (j !== 0) geometry.faceVertexUvs[i][fi + 1].push(uv);
                        }
                    }
                }

                if (hasFaceNormal) {
                    normalIndex = faces[offset++] * 3;
                    faceA.normal.set(normals[normalIndex++], normals[normalIndex++], normals[normalIndex]);
                    faceB.normal.copy(faceA.normal);
                }

                if (hasFaceVertexNormal) {
                    for (i = 0; i < 4; i++) {
                        normalIndex = faces[offset++] * 3;

                        normal = new Vector3(
                            normals[normalIndex++],
                            normals[normalIndex++],
                            normals[normalIndex]
                        );

                        if (i !== 2) {
                            faceA.vertexNormals.push(normal);
                        }
                        if (i !== 0) {
                            faceB.vertexNormals.push(normal);
                        }
                    }
                }

                if (hasFaceColor) {
                    colorIndex = faces[offset++];
                    hex = colors[colorIndex];

                    faceA.color.setHex(hex);
                    faceB.color.setHex(hex);
                }


                if (hasFaceVertexColor) {
                    for (i = 0; i < 4; i++) {
                        colorIndex = faces[offset++];
                        hex = colors[colorIndex];

                        if (i !== 2) {
                            faceA.vertexColors.push(new Color(hex));
                        }
                        if (i !== 0) {
                            faceB.vertexColors.push(new Color(hex));
                        }
                    }

                }

                geometry.faces.push(faceA);
                geometry.faces.push(faceB);
            } else {
                face = new Face3(faces[offset++], faces[offset++], faces[offset++]);

                if (hasMaterial) {
                    materialIndex = faces[offset++];
                    face.materialIndex = materialIndex;
                }

                // To get face <=> uv index correspondence

                fi = geometry.faces.length;
                if (hasFaceVertexUv) {
                    for (i = 0; i < nUvLayers; i++) {
                        uvLayer = json.uvs[i];
                        geometry.faceVertexUvs[i][fi] = [];

                        for (j = 0; j < 3; j++) {
                            uvIndex = faces[offset++];

                            u = uvLayer[uvIndex * 2];
                            v = uvLayer[uvIndex * 2 + 1];

                            uv = new Vector2(u, v);

                            geometry.faceVertexUvs[i][fi].push(uv);
                        }
                    }
                }

                if (hasFaceNormal) {
                    normalIndex = faces[offset++] * 3;
                    face.normal.set(normals[normalIndex++], normals[normalIndex++], normals[normalIndex]);
                }

                if (hasFaceVertexNormal) {
                    for (i = 0; i < 3; i++) {
                        normalIndex = faces[offset++] * 3;

                        normal = new Vector3(
                            normals[normalIndex++],
                            normals[normalIndex++],
                            normals[normalIndex]
                        );

                        face.vertexNormals.push(normal);
                    }
                }

                if (hasFaceColor) {
                    colorIndex = faces[offset++];
                    face.color.setHex(colors[colorIndex]);
                }

                if (hasFaceVertexColor) {
                    for (i = 0; i < 3; i++) {
                        colorIndex = faces[offset++];
                        face.vertexColors.push(new Color(colors[colorIndex]));
                    }
                }

                geometry.faces.push(face);
            }
        }
    }

    private parseSkin(json: any, geometry: Geometry) {
        const influencesPerVertex = json.influencesPerVertex != null ? json.influencesPerVertex : 2;

        if (json.skinWeights) {
            this.flatArrayToVector4Array(json.skinWeights, geometry.skinWeights, influencesPerVertex);
        }
        if (json.skinIndices) {
            this.flatArrayToVector4Array(json.skinIndices, geometry.skinIndices, influencesPerVertex);
        }

        geometry.bones = json.bones;

        if (geometry.bones && geometry.bones.length > 0 && (
            geometry.skinWeights.length !== geometry.skinIndices.length
            || geometry.skinIndices.length !== geometry.vertices.length
        )) {
            console.warn('When skinning, number of vertices (' + geometry.vertices.length + '), skin indices ('
                + geometry.skinIndices.length + '), and skin weights (' + geometry.skinWeights.length
                + ') should match');
        }
    }

    private parseMorphing(json: any, geometry: Geometry) {
        const scale = json.scale;

        if (json.morphTargets != null) {
            for (let i = 0, l = json.morphTargets.length; i < l; i++) {
                geometry.morphTargets[i] = {name: json.morphTargets[i].name, vertices: []};

                const dstVertices = geometry.morphTargets[i].vertices;
                const srcVertices = json.morphTargets[i].vertices;

                for (let v = 0, vl = srcVertices.length; v < vl; v += 3) {
                    const vertex = new Vector3();
                    vertex.x = srcVertices[v] * scale;
                    vertex.y = srcVertices[v + 1] * scale;
                    vertex.z = srcVertices[v + 2] * scale;

                    dstVertices.push(vertex);
                }
            }
        }

        if (json.morphColors != null && json.morphColors.length > 0) {
            console.warn('"morphColors" property is no longer supported by JsonLoader. Using them as face colors.');

            const faces = geometry.faces;
            const morphColors = json.morphColors[0].colors;

            for (let i = 0, l = faces.length; i < l; i++) {
                faces[i].color.fromArray(morphColors, i * 3);
            }
        }
    }

    private parseAnimations(json: any, geometry: Geometry) {
        let outputAnimations = [];

        // Parse old style Bone/Hierarchy animations
        let animations = [];
        if (json.animation != null) {
            animations.push(json.animation);
        }

        if (json.animations != null) {
            if (json.animations.length) {
                animations = animations.concat(json.animations);
            } else {
                animations.push(json.animations);
            }
        }

        for (let i = 0; i < animations.length; i++) {
            const clip = AnimationClip.parseAnimation(animations[i], geometry.bones);
            if (clip) {
                outputAnimations.push(clip);
            }
        }

        // {arse implicit morph animations
        if (geometry.morphTargets) {
            const morphAnimationClips = AnimationClip.CreateClipsFromMorphTargetSequences(
                geometry.morphTargets,
                10,
                false
            );
            outputAnimations = outputAnimations.concat(morphAnimationClips);
        }

        if (outputAnimations.length > 0) {
            geometry.animations = outputAnimations;
        }
    }

    private initMaterials(materials: any[], texturePath: string | undefined, crossOrigin: string) {
        const array = [];
        for (let i = 0; i < materials.length; i++) {
            array[i] = this.createMaterial(materials[i], texturePath, crossOrigin);
        }
        return array;
    }

    private createMaterial(material: any, texturePath: string | undefined, crossOrigin: string) {
        // Convert from old material format
        const textures = {};
        const color = new Color();

        const json = {
            name: undefined,
            uuid: generateUUID(),
            type: 'MeshLambertMaterial',
            blending: undefined,
            color: undefined,
            specular: undefined,
            emissive: undefined,
            shininess: undefined,
            map: undefined,
            emissiveMap: undefined,
            lightMap: undefined,
            aoMap: undefined,
            bumpMap: undefined,
            bumpScale: undefined,
            normalMap: undefined,
            normalScale: undefined,
            specularMap: undefined,
            metalnessMap: undefined,
            roughnessMap: undefined,
            alphaMap: undefined,
            side: undefined,
            opacity: undefined,
            vertexColors: undefined,
            transparent: undefined
        };

        for (const name of Object.keys(material)) {
            const value = material[name];
            switch (name) {
                case 'DbgColor':
                case 'DbgIndex':
                case 'opticalDensity':
                case 'illumination':
                    break;
                case 'DbgName':
                    json.name = value;
                    break;
                case 'blending':
                    // @ts-ignore
                    json.blending = BlendingMode[value];
                    break;
                case 'colorAmbient':
                case 'mapAmbient':
                    console.warn(`Property "${name}" is no longer supported by JsonLoader`);
                    break;
                case 'colorDiffuse':
                    // @ts-ignore
                    json.color = color.fromArray(value).getHex();
                    break;
                case 'colorSpecular':
                    // @ts-ignore
                    json.specular = color.fromArray(value).getHex();
                    break;
                case 'colorEmissive':
                    // @ts-ignore
                    json.emissive = color.fromArray(value).getHex();
                    break;
                case 'specularCoef':
                    json.shininess = value;
                    break;
                case 'shading':
                    if (value.toLowerCase() === 'basic') {
                        json.type = 'MeshBasicMaterial';
                    } else if (value.toLowerCase() === 'phong') {
                        json.type = 'MeshPhongMaterial';
                    } else if (value.toLowerCase() === 'standard') {
                        json.type = 'MeshStandardMaterial';
                    }
                    break;
                case 'mapDiffuse': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapDiffuseRepeat,
                        material.mapDiffuseOffset, material.mapDiffuseWrap, material.mapDiffuseAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.map = uuidAndTexture.uuid;
                    break;
                }
                case 'mapDiffuseRepeat':
                case 'mapDiffuseOffset':
                case 'mapDiffuseWrap':
                case 'mapDiffuseAnisotropy':
                    break;
                case 'mapEmissive': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapEmissiveRepeat,
                        material.mapEmissiveOffset, material.mapEmissiveWrap, material.mapEmissiveAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.emissiveMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapEmissiveRepeat':
                case 'mapEmissiveOffset':
                case 'mapEmissiveWrap':
                case 'mapEmissiveAnisotropy':
                    break;
                case 'mapLight': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapLightRepeat,
                        material.mapLightOffset, material.mapLightWrap, material.mapLightAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.lightMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapLightRepeat':
                case 'mapLightOffset':
                case 'mapLightWrap':
                case 'mapLightAnisotropy':
                    break;
                case 'mapAO': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapAORepeat,
                        material.mapAOOffset, material.mapAOWrap, material.mapAOAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.aoMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapAORepeat':
                case 'mapAOOffset':
                case 'mapAOWrap':
                case 'mapAOAnisotropy':
                    break;
                case 'mapBump': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapBumpRepeat,
                        material.mapBumpOffset, material.mapBumpWrap, material.mapBumpAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.bumpMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapBumpScale':
                    json.bumpScale = value;
                    break;
                case 'mapBumpRepeat':
                case 'mapBumpOffset':
                case 'mapBumpWrap':
                case 'mapBumpAnisotropy':
                    break;
                case 'mapNormal': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapNormalRepeat,
                        material.mapNormalOffset, material.mapNormalWrap, material.mapNormalAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.normalMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapNormalFactor':
                    json.normalScale = value;
                    break;
                case 'mapNormalRepeat':
                case 'mapNormalOffset':
                case 'mapNormalWrap':
                case 'mapNormalAnisotropy':
                    break;
                case 'mapSpecular': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapSpecularRepeat,
                        material.mapSpecularOffset, material.mapSpecularWrap, material.mapSpecularAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.specularMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapSpecularRepeat':
                case 'mapSpecularOffset':
                case 'mapSpecularWrap':
                case 'mapSpecularAnisotropy':
                    break;
                case 'mapMetalness': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapMetalnessRepeat,
                        material.mapMetalnessOffset, material.mapMetalnessWrap, material.mapMetalnessAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.metalnessMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapMetalnessRepeat':
                case 'mapMetalnessOffset':
                case 'mapMetalnessWrap':
                case 'mapMetalnessAnisotropy':
                    break;
                case 'mapRoughness': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapRoughnessRepeat,
                        material.mapRoughnessOffset, material.mapRoughnessWrap, material.mapRoughnessAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.roughnessMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapRoughnessRepeat':
                case 'mapRoughnessOffset':
                case 'mapRoughnessWrap':
                case 'mapRoughnessAnisotropy':
                    break;
                case 'mapAlpha': {
                    const uuidAndTexture = this.loadTexture(value, texturePath, crossOrigin, material.mapAlphaRepeat,
                        material.mapAlphaOffset, material.mapAlphaWrap, material.mapAlphaAnisotropy);
                    // @ts-ignore
                    textures[uuidAndTexture.uuid] = uuidAndTexture.texture;
                    // @ts-ignore
                    json.alphaMap = uuidAndTexture.uuid;
                    break;
                }
                case 'mapAlphaRepeat':
                case 'mapAlphaOffset':
                case 'mapAlphaWrap':
                case 'mapAlphaAnisotropy':
                    break;
                case 'flipSided':
                    // @ts-ignore
                    json.side = BackSide;
                    break;
                case 'doubleSided':
                    // @ts-ignore
                    json.side = DoubleSide;
                    break;
                case 'transparency':
                    console.warn('Property "transparency" was renamed to "opacity"');
                    json.opacity = value;
                    break;
                case 'depthTest':
                case 'depthWrite':
                case 'colorWrite':
                case 'opacity':
                case 'reflectivity':
                case 'transparent':
                case 'visible':
                case 'wireframe':
                    // @ts-ignore
                    json[name] = value;
                    break;
                case 'vertexColors':
                    if (value === true) {
                        // @ts-ignore
                        json.vertexColors = VertexColors;
                    } else if (value === 'face') {
                        // @ts-ignore
                        json.vertexColors = FaceColors;
                    }
                    break;
                default:
                    console.error(`Property "${name} = ${value}" is not supported by JsonLoader`);
                    break;
            }
        }

        if (json.type === 'MeshBasicMaterial') {
            delete json.emissive;
        }
        if (json.type !== 'MeshPhongMaterial') {
            delete json.specular;
        }

        // @ts-ignore
        if (json.opacity < 1) {
            // @ts-ignore
            json.transparent = true;
        }

        this.materialLoader.setTextures(textures);
        return this.materialLoader.parse(json);
    }

    private loadTexture(path: string,
                        texturePath: string | undefined,
                        crossOrigin: string,
                        repeat: any,
                        offset: any[],
                        wrap: any[],
                        anisotropy: any) {
        const fullPath = texturePath + path;
        // @ts-ignore
        const loader = Loader['Handlers'].get(fullPath);

        let texture;
        if (loader != null) {
            texture = loader.load(fullPath);
        } else {
            this.textureLoader.setCrossOrigin(crossOrigin);
            texture = this.textureLoader.load(fullPath);
        }

        if (repeat != null) {
            texture.repeat.fromArray(repeat);
            if (repeat[0] !== 1) {
                texture.wrapS = RepeatWrapping;
            }
            if (repeat[1] !== 1) {
                texture.wrapT = RepeatWrapping;
            }
        }

        if (offset != null) {
            texture.offset.fromArray(offset);
        }

        if (wrap != null) {
            if (wrap[0] === 'repeat') {
                texture.wrapS = RepeatWrapping;
            } else if (wrap[0] === 'mirror') {
                texture.wrapS = MirroredRepeatWrapping;
            }

            if (wrap[1] === 'repeat') {
                texture.wrapT = RepeatWrapping;
            } else if (wrap[1] === 'mirror') {
                texture.wrapT = MirroredRepeatWrapping;
            }

        }

        if (anisotropy != null) {
            texture.anisotropy = anisotropy;
        }

        const uuid = generateUUID();
        return {uuid, texture};
    }
}
