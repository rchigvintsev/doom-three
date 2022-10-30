import {
    BufferAttribute,
    BufferGeometry,
    FileLoader,
    Loader,
    LoadingManager,
    Material,
    Mesh,
    MeshPhongMaterial,
    Vector2,
    Vector3
} from 'three';

import {BufferAttributes} from '../util/buffer-attributes';

const TYPE_LWO2 = 0x4c574f32;

const CHUNK_TYPE_FORM = 0x464f524d;
const CHUNK_TYPE_PNTS = 0x504e5453;
const CHUNK_TYPE_POLS = 0x504f4c53;
const CHUNK_TYPE_SURF = 0x53555246;
const CHUNK_TYPE_TAGS = 0x54414753;
const CHUNK_TYPE_LAYR = 0x4c415952;
const CHUNK_TYPE_VMAP = 0x564d4150;
const CHUNK_TYPE_PTAG = 0x50544147;
const CHUNK_TYPE_VMAD = 0x564d4144;
const CHUNK_TYPE_TXUV = 0x54585556;
const CHUNK_TYPE_RGB = 0x52474220;
const CHUNK_TYPE_RGBA = 0x52474241;
const CHUNK_TYPE_FACE = 0x46414345;

const CHUNK_HEADER_SIZE = 8;

/**
 * Unfortunately LWOLoader from "three" package does not take into account discontinuous UVs.
 */
export class Lwo2MeshLoader extends Loader {
    private fileLoader: FileLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(manager);
        this.fileLoader.setResponseType('arraybuffer');
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Mesh> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<ArrayBuffer>content));
    }

    private parse(buffer: ArrayBuffer): Mesh {
        const context = new ParsingContext(buffer);

        if (context.dataView.getUint32(0) !== CHUNK_TYPE_FORM) {
            throw new Error('LWO header is not found');
        }

        const typeOffset = CHUNK_HEADER_SIZE;
        if (context.dataView.getUint32(typeOffset) !== TYPE_LWO2) {
            const type = this.decodeText(buffer, typeOffset);
            throw new Error(`Unsupported LWO type: ${type}`);
        }

        let cursor = CHUNK_HEADER_SIZE + 4;
        while (cursor < context.dataView.byteLength) {
            if (context.dataView.getUint8(cursor) === 0) {
                cursor++;
            } else {
                const chunkType = context.dataView.getInt32(cursor);
                const chunkSize = context.dataView.getInt32(cursor + 4);

                cursor += CHUNK_HEADER_SIZE;

                switch (chunkType) {
                    case CHUNK_TYPE_TAGS:
                        this.parseTags(context, cursor, chunkSize);
                        break;
                    case CHUNK_TYPE_LAYR:
                        this.parseLayer(context, cursor);
                        break;
                    case CHUNK_TYPE_PNTS:
                        this.parsePoints(context, cursor, chunkSize);
                        break;
                    case CHUNK_TYPE_VMAP:
                        this.parseVertexMapping(context, cursor, chunkSize);
                        break;
                    case CHUNK_TYPE_VMAD:
                        this.parseVertexMapping(context, cursor, chunkSize, true);
                        break;
                    case CHUNK_TYPE_POLS:
                        this.parsePolygons(context, cursor, chunkSize);
                        break;
                    case CHUNK_TYPE_PTAG:
                        this.parsePolygonTagMapping(context, cursor, chunkSize);
                        break;
                    default:
                    // Ignore other tags
                }

                cursor += chunkSize;
            }
        }

        if (context.layers.length === 0) {
            throw new Error('Invalid LWO model: at least one layer must be present');
        }
        const layer = context.firstLayer;
        const geometry = this.createGeometry(layer);
        const materials = this.createMaterials(context);
        return new Mesh(geometry, materials);
    }

    private decodeText(buffer: ArrayBuffer, offset: number, length = 4): string {
        return new TextDecoder().decode(new Uint8Array(buffer, offset, length));
    }

    private parseTags(context: ParsingContext, chunkOffset: number, chunkSize: number) {
        let cursor = chunkOffset;
        while (cursor < chunkOffset + chunkSize) {
            const s = this.readString(context, cursor);
            if (s.size > 0) {
                context.tags.push(s.value!.trim());
            }
            cursor += s.size;
        }
    }

    private parseLayer(context: ParsingContext, chunkOffset: number) {
        let cursor = chunkOffset;
        const index = context.dataView.getUint16(cursor);
        cursor += 16; // index (2) + flags (2) + pivot (4 * 3)
        const s = this.readString(context, cursor);
        context.layers[index] = context.currentLayer = new Layer(s.value);
    }

    private parsePoints(context: ParsingContext, chunkOffset: number, chunkSize: number) {
        if (chunkSize % 12 !== 0) {
            throw new Error(`Points chunk size (${chunkSize}) is not multiple of vertex length`);
        }
        if (!context.currentLayer) {
            throw new Error('Failed to parse points: current layer is undefined');
        }
        const pointsNumber = chunkSize / 12;
        for (let i = 0; i < pointsNumber; i++) {
            const pointOffset = i * 12;
            const x = context.dataView.getFloat32(chunkOffset + pointOffset);
            const y = context.dataView.getFloat32(chunkOffset + pointOffset + 4);
            const z = -context.dataView.getFloat32(chunkOffset + pointOffset + 8);
            context.currentLayer.points.push(new Vector3(x, y, z));
        }
    }

    private parseVertexMapping(context: ParsingContext, chunkOffset: number, chunkSize: number, perPoly = false) {
        let cursor = chunkOffset;

        const type = context.dataView.getUint32(cursor);
        cursor += 4;

        switch (type) {
            case CHUNK_TYPE_TXUV: {
                if (!context.currentLayer) {
                    throw new Error('Failed to parse vertex mapping: current layer is undefined');
                }

                const dimension = context.dataView.getInt16(cursor);
                cursor += 2;

                const s = this.readString(context, cursor);
                const name = s.value;
                cursor += s.size;

                if (dimension !== 2) {
                    console.warn(`Skipping UV channel "${name}" with unsupported dimension ${dimension}`);
                    return;
                }

                let i = 0;
                const vertexMap = new VertexMap(perPoly);
                while (cursor < chunkOffset + chunkSize) {
                    let idx = this.readIndex(context, cursor);
                    vertexMap.vertexIndices[i] = idx.value;
                    cursor += idx.size;
                    if (perPoly) {
                        idx = this.readIndex(context, cursor);
                        vertexMap.polygonIndices[i] = idx.value;
                        cursor += idx.size;
                    }
                    const x = context.dataView.getFloat32(cursor);
                    const y = context.dataView.getFloat32(cursor + 4);
                    vertexMap.uvs[i] = new Vector2(x, y);
                    cursor += 8;
                    i++;
                }
                context.currentLayer.vertexMaps.push(vertexMap);
                break;
            }
            case CHUNK_TYPE_RGB:
            case CHUNK_TYPE_RGBA:
                break;
            default:
                console.warn(`Unsupported VMAP sub-chunk type "${this.decodeText(context.buffer, chunkOffset)}" found at ${chunkOffset}`);
        }
    }

    private parsePolygons(context: ParsingContext, chunkOffset: number, chunkSize: number) {
        const type = context.dataView.getInt32(chunkOffset);
        switch (type) {
            case CHUNK_TYPE_FACE: {
                if (!context.currentLayer) {
                    throw new Error('Failed to parse polygons: current layer is undefined');
                }

                let cursor = chunkOffset + 4;
                while (cursor < chunkOffset + chunkSize) {
                    const verticesNumber = context.dataView.getInt16(cursor) & 0x03ff;
                    if (verticesNumber !== 3) {
                        throw new Error(`Unsupported number of polygon vertices: ${verticesNumber}`);
                    }
                    cursor += 2;

                    let result = this.readIndex(context, cursor);
                    cursor += result.size;
                    const a = result.value;

                    result = this.readIndex(context, cursor);
                    cursor += result.size;
                    const b = result.value;

                    result = this.readIndex(context, cursor);
                    cursor += result.size;
                    const c = result.value;

                    const polygon = new Polygon(a, b, c);
                    context.currentLayer.polygons.push(polygon);
                }
                break;
            }
            default:
                console.warn(`Unsupported polygon type "${this.decodeText(context.buffer, chunkOffset)}" found at ${chunkOffset}`);
        }
    }

    private parsePolygonTagMapping(context: ParsingContext, chunkOffset: number, chunkSize: number) {
        const type = context.dataView.getUint32(chunkOffset);
        switch (type) {
            case CHUNK_TYPE_SURF: {
                if (!context.currentLayer) {
                    throw new Error('Failed to parse polygon-tag mapping: current layer is undefined');
                }

                let cursor = chunkOffset + 4;
                while (cursor < chunkOffset + chunkSize) {
                    const idx = this.readIndex(context, cursor);
                    cursor += idx.size;
                    const tag = context.dataView.getUint16(cursor);
                    cursor += 2;
                    const polygon = context.currentLayer.polygons[idx.value];
                    if (polygon) {
                        polygon.materialIndex = tag;
                    } else {
                        console.warn(`Polygon is not found by index ${idx.value}`);
                    }
                }
                break;
            }
            default:
                console.warn(`Unsupported PTAG sub-chunk type "${new TextDecoder().decode(new Uint8Array(context.buffer, chunkOffset, 4))}" found at ${chunkOffset}`);
        }
    }

    private readString(context: ParsingContext, offset: number): { value?: string, size: number } {
        let cursor = offset;
        while (context.dataView.getUint8(cursor) !== 0) {
            cursor++;
        }
        if (cursor > offset) {
            const length = cursor - offset;
            const value = new TextDecoder().decode(new Uint8Array(context.buffer, offset, length));
            const size = length % 2 === 0 ? length + 2 : length + 1;
            return {value: value, size: size};
        }
        return {size: 0};
    }

    private readIndex(context: ParsingContext, offset: number): { value: number, size: number } {
        let index, size;
        if (context.dataView.getUint8(offset) !== 255) {
            index = context.dataView.getUint8(offset) * 256 + context.dataView.getUint8(offset + 1);
            size = 2;
        } else {
            index = context.dataView.getUint8(offset + 1) * 65536 + context.dataView.getUint8(offset + 2) * 256
                + context.dataView.getUint8(offset + 3);
            size = 4;
        }
        return {value: index, size: size};
    }

    private createGeometry(layer: Layer): BufferGeometry {
        const uvs: Vector2[] = [];
        for (const vertexMap of layer.vertexMaps) {
            if (!vertexMap.perPoly) {
                for (let i = 0; i < vertexMap.vertexIndices.length; i++) {
                    const vertexIndex = vertexMap.vertexIndices[i];
                    const uv = vertexMap.uvs[i];
                    uvs[vertexIndex] = new Vector2(uv.x, uv.y);
                }
            } else {
                for (let i = 0; i < vertexMap.polygonIndices.length; i++) {
                    const polygon = layer.polygons[vertexMap.polygonIndices[i]];
                    if ([polygon.a, polygon.b, polygon.c].findIndex(v => v === vertexMap.vertexIndices[i]) >= 0) {
                        if (vertexMap.vertexIndices[i] === polygon.a) {
                            polygon.vertexUv.x = uvs.length;
                        } else if (vertexMap.vertexIndices[i] === polygon.b) {
                            polygon.vertexUv.y = uvs.length;
                        } else if (vertexMap.vertexIndices[i] === polygon.c) {
                            polygon.vertexUv.z = uvs.length;
                        }
                        uvs.push(new Vector2(vertexMap.uvs[i].x, vertexMap.uvs[i].y));
                    }
                }
            }
        }

        this.computeVertexNormals(layer);

        const geometryVertices: Vector3[] = [];
        const geometryNormals: Vector3[] = [];
        const geometryUvs: Vector2[] = [];

        for (const polygon of layer.polygons) {
            geometryVertices.push(layer.points[polygon.a], layer.points[polygon.b], layer.points[polygon.c]);
            geometryNormals.push(polygon.vertexNormals[0], polygon.vertexNormals[1], polygon.vertexNormals[2]);
            geometryUvs.push(
                uvs[polygon.vertexUv.x] || new Vector2(),
                uvs[polygon.vertexUv.y] || new Vector2(),
                uvs[polygon.vertexUv.z] || new Vector2()
            );
        }

        const bufferGeometry = new BufferGeometry();
        const positionAttr = new BufferAttribute(new Float32Array(geometryVertices.length * 3), 3);
        bufferGeometry.setAttribute('position', BufferAttributes.copyVector3sArray(positionAttr, geometryVertices));
        const normalAttr = new BufferAttribute(new Float32Array(geometryNormals.length * 3), 3);
        bufferGeometry.setAttribute('normal', BufferAttributes.copyVector3sArray(normalAttr, geometryNormals));
        const uvAttr = new BufferAttribute(new Float32Array(geometryUvs.length * 2), 2);
        bufferGeometry.setAttribute('uv', BufferAttributes.copyVector2sArray(uvAttr, geometryUvs));
        bufferGeometry.groups = this.computeGroups(layer);
        return bufferGeometry;
    }

    private computeVertexNormals(layer: Layer) {
        const vertexNormals: Vector3[] = [];
        for (let i = 0; i < layer.points.length; i++) {
            vertexNormals[i] = new Vector3();
        }

        const cb = new Vector3();
        const ab = new Vector3();

        for (const polygon of layer.polygons) {
            const vA = layer.points[polygon.a];
            const vB = layer.points[polygon.b];
            const vC = layer.points[polygon.c];

            cb.subVectors(vC, vB);
            ab.subVectors(vA, vB);
            cb.cross(ab);

            vertexNormals[polygon.a].add(cb);
            vertexNormals[polygon.b].add(cb);
            vertexNormals[polygon.c].add(cb);
        }

        vertexNormals.forEach(vertex => vertex.normalize());

        for (const polygon of layer.polygons) {
            if (polygon.vertexNormals.length === 3) {
                polygon.vertexNormals[0].copy(vertexNormals[polygon.a]);
                polygon.vertexNormals[1].copy(vertexNormals[polygon.b]);
                polygon.vertexNormals[2].copy(vertexNormals[polygon.c]);
            } else {
                polygon.vertexNormals[0] = vertexNormals[polygon.a].clone();
                polygon.vertexNormals[1] = vertexNormals[polygon.b].clone();
                polygon.vertexNormals[2] = vertexNormals[polygon.c].clone();
            }
        }
    }

    private computeGroups(layer: Layer): { start: number, count: number, materialIndex?: number }[] {
        let materialIndex = undefined;
        let group: { start: number, count: number, materialIndex?: number } | undefined;
        const groups: { start: number, count: number, materialIndex?: number }[] = [];

        let i = 0;
        for (; i < layer.polygons.length; i++) {
            const polygon = layer.polygons[i];
            if (polygon.materialIndex !== materialIndex) {
                materialIndex = polygon.materialIndex;
                if (group) {
                    group.count = (i * 3) - group.start;
                    groups.push(group);
                }

                group = {
                    start: i * 3,
                    count: 0,
                    materialIndex: materialIndex
                };
            }
        }

        if (group) {
            group.count = (i * 3) - group.start;
            groups.push(group);
        }

        return groups;
    }

    private createMaterials(context: ParsingContext) {
        const materials: Material[] = [];
        for (const tag of context.tags) {
            materials.push(new MeshPhongMaterial({name: tag}));
        }
        return materials;
    }
}

class ParsingContext {
    readonly dataView: DataView;
    readonly materials: MeshPhongMaterial[] = [];
    readonly tags: string[] = [];
    readonly layers: Layer[] = [];

    currentLayer?: Layer;

    constructor(readonly buffer: ArrayBuffer) {
        this.dataView = new DataView(buffer);
    }

    get firstLayer(): Layer {
        let i = 0;
        let layer = this.layers[i];
        while (i < this.layers.length - 1 && !layer) {
            layer = this.layers[++i];
        }
        return layer;
    }
}

class Layer {
    readonly points: Vector3[] = [];
    readonly vertexMaps: VertexMap[] = [];
    readonly polygons: Polygon[] = [];

    constructor(readonly name?: string) {
    }
}

class VertexMap {
    readonly vertexIndices: number[] = [];
    readonly polygonIndices: number[] = [];
    readonly uvs: Vector2[] = [];

    constructor(readonly perPoly: boolean) {
    }
}

class Polygon {
    readonly vertexUv = new Vector3();
    readonly vertexNormals: Vector3[] = [];

    materialIndex = 0;

    constructor(readonly a: number, readonly b: number, readonly c: number) {
    }
}
