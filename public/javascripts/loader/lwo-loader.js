import {LwoPolygon} from './lwo-polygon.js';
import {JSONLoader} from './json-loader.js';

const TYPE_LWO2 = 0x4c574f32;

const CHUNK_TYPE_FORM = 0x464f524d;
const CHUNK_TYPE_PNTS = 0x504e5453;
const CHUNK_TYPE_POLS = 0x504f4c53;
const CHUNK_TYPE_SURF = 0x53555246;
const CHUNK_TYPE_TAGS = 0x54414753;
const CHUNK_TYPE_LAYR = 0x4c415952;
const CHUNK_TYPE_BBOX = 0x42424f58;
const CHUNK_TYPE_VMAP = 0x564d4150;
const CHUNK_TYPE_PTAG = 0x50544147;
const CHUNK_TYPE_VMAD = 0x564d4144;
const CHUNK_TYPE_CLIP = 0x434c4950;
const CHUNK_TYPE_TXUV = 0x54585556;
const CHUNK_TYPE_RGB  = 0x52474220;
const CHUNK_TYPE_RGBA = 0x52474241;
const CHUNK_TYPE_TFLG = 0x54464c47;
const CHUNK_TYPE_TSIZ = 0x5453495a;
const CHUNK_TYPE_TCTR = 0x54435452;
const CHUNK_TYPE_COLR = 0x434f4c52;
const CHUNK_TYPE_LUMI = 0x4c554d49;
const CHUNK_TYPE_FLAG = 0x464c4147;
const CHUNK_TYPE_DIFF = 0x44494646;
const CHUNK_TYPE_SPEC = 0x53504543;
const CHUNK_TYPE_REFL = 0x5245464c;
const CHUNK_TYPE_TRAN = 0x5452414e;
const CHUNK_TYPE_VLUM = 0x564c554d;
const CHUNK_TYPE_VDIF = 0x56444946;
const CHUNK_TYPE_VSPC = 0x56535043;
const CHUNK_TYPE_VTRN = 0x5654524e;
const CHUNK_TYPE_TIMG = 0x54494d47;
const CHUNK_TYPE_RIND = 0x52494e44;
const CHUNK_TYPE_GLOS = 0x474c4f53;
const CHUNK_TYPE_SMAN = 0x534d414e;
const CHUNK_TYPE_BUMP = 0x42554d50;
const CHUNK_TYPE_TRNL = 0x54524e4c;
const CHUNK_TYPE_BLOK = 0x424c4f4b;
const CHUNK_TYPE_FACE = 0x46414345;
const CHUNK_TYPE_VCOL = 0x56434f4c;

const CHUNK_HEADER_SIZE    = 8;
const SUBCHUNK_HEADER_SIZE = 6;

function readS0(dataView, offset, buffer) {
    let cursor = offset;
    while (dataView.getUint8(cursor) !== 0)
        cursor++;
    if (cursor > offset) {
        const length = cursor - offset;
        const value = new TextDecoder().decode(new Uint8Array(buffer, offset, length));
        const size = length % 2 === 0 ? length + 2 : length + 1;
        return {value: value, size: size};
    }
    return {size: 0};
}

function readVx(dataView, offset) {
    let index, size;
    if (dataView.getUint8(offset) !== 255) {
        index = dataView.getUint8(offset) * 256 + dataView.getUint8(offset + 1);
        size = 2;
    } else {
        index = dataView.getUint8(offset + 1) * 65536 + dataView.getUint8(offset + 2) * 256
            + dataView.getUint8(offset + 3);
        size = 4;
    }
    return {value: index, size: size};
}

export class LWOLoader {
    constructor(manager) {
        this._fileLoader = new THREE.FileLoader(manager);
        this._fileLoader.setResponseType('arraybuffer');
        this._jsonLoader = new JSONLoader(manager);
    }

    load(model, onLoad, onProgress, onError) {
        if (!onLoad)
            return this.parse(model);
        const scope = this;
        this._fileLoader.load(model, function (buffer) {
            onLoad(scope.parse(buffer));
        }, onProgress, onError);
    }

    parse(buffer) {
        const dataView = new DataView(buffer);

        if (dataView.getUint32(0) !== CHUNK_TYPE_FORM)
            throw 'Failed to find LWO header';

        const typeOffset = CHUNK_HEADER_SIZE;
        if (dataView.getUint32(typeOffset) !== TYPE_LWO2) {
            const type = new TextDecoder().decode(new Uint8Array(buffer, typeOffset, 4));
            throw 'Unsupported type: ' + type;
        }

        this.tags = [];
        this.materials = [];
        this.layers = [];
        this.currentLayer = null;

        let cursor = CHUNK_HEADER_SIZE + 4;
        while (cursor < dataView.byteLength) {
            if (dataView.getUint8(cursor) === 0)
                cursor++;
            else {
                const chunkType = dataView.getInt32(cursor);
                const chunkSize = dataView.getInt32(cursor + 4);

                cursor += CHUNK_HEADER_SIZE;

                switch (chunkType) {
                    case CHUNK_TYPE_TAGS:
                        this.parseTags(dataView, cursor, chunkSize, buffer);
                        break;
                    case CHUNK_TYPE_LAYR:
                        this.parseLayer(dataView, cursor, chunkSize, buffer);
                        break;
                    case CHUNK_TYPE_PNTS:
                        this.parsePoints(dataView, cursor, chunkSize);
                        break;
                    case CHUNK_TYPE_BBOX:
                        this.parseBoundingBox(dataView, cursor);
                        break;
                    case CHUNK_TYPE_VMAP:
                    case CHUNK_TYPE_VMAD:
                        this.parseVertexMapping(dataView, cursor, chunkSize, buffer, chunkType === CHUNK_TYPE_VMAD);
                        break;
                    case CHUNK_TYPE_POLS:
                        this.parsePolygons(dataView, cursor, chunkSize, buffer);
                        break;
                    case CHUNK_TYPE_PTAG:
                        this.parsePolygonTagMapping(dataView, cursor, chunkSize, buffer);
                        break;
                    case CHUNK_TYPE_SURF:
                        this.parseSurface(dataView, cursor, chunkSize, buffer);
                        break;
                    case CHUNK_TYPE_CLIP:
                        break;
                    default:
                        console.warn('Unsupported chunk type '
                            + new TextDecoder().decode(new Uint8Array(buffer, cursor - CHUNK_HEADER_SIZE, 4))
                            + ' found at ' + cursor);
                }

                cursor += chunkSize;
            }
        }

        const geomAndMat = this._jsonLoader.parse(this.composeJson());
        geomAndMat.geometry.computeFaceNormals();
        geomAndMat.geometry.computeVertexNormals();
        return geomAndMat;
    }

    parseTags(dataView, chunkOffset, chunkSize, buffer) {
        let cursor = chunkOffset;
        while (cursor < chunkOffset + chunkSize) {
            const result = readS0(dataView, cursor, buffer);
            if (result.size > 0)
                this.tags.push(result.value.trim());
            cursor += result.size;
        }
    }

    parseLayer(dataView, chunkOffset, chunkSize, buffer) {
        let cursor = chunkOffset;
        const index = dataView.getUint16(cursor);
        cursor += 16; // index (2) + flags (2) + pivot (4 * 3)
        const name = readS0(dataView, cursor, buffer).value;
        this.layers[index] = this.currentLayer = new Layer(name);
    }

    parsePoints(dataView, chunkOffset, chunkSize) {
        if (chunkSize % 12 !== 0)
            throw 'Points chunk length (' + chunkSize + ') is not multiple of vertex length';
        if (!this.currentLayer)
            throw 'Failed to parse points: current layer is undefined';
        const pointsNumber = chunkSize / 12;
        for (let i = 0; i < pointsNumber; i++) {
            const pointOffset = i * 12;
            const x = dataView.getFloat32(chunkOffset + pointOffset);
            const y = dataView.getFloat32(chunkOffset + pointOffset + 4);
            const z = dataView.getFloat32(chunkOffset + pointOffset + 8);
            const point = new THREE.Vector3(x, y, z);
            this.currentLayer.points.push(point);
        }
    }

    parseBoundingBox(dataView, chunkOffset) {
        if (!this.currentLayer)
            throw 'Failed to parse bounding box: current layer is undefined';
        let cursor = chunkOffset;

        const min = [];
        for (let i = 0; i < 3; i++) {
            min.push(dataView.getFloat32(cursor));
            cursor += 4;
        }
        this.currentLayer.bbox.min = new THREE.Vector3().fromArray(min);

        const max = [];
        for (let i = 0; i < 3; i++) {
            max.push(dataView.getFloat32(cursor));
            cursor += 4;
        }
        this.currentLayer.bbox.max = new THREE.Vector3().fromArray(max);
    }

    parsePolygons(dataView, chunkOffset, chunkSize, buffer) {
        const type = dataView.getInt32(chunkOffset);
        switch (type) {
            case CHUNK_TYPE_FACE:
                if (!this.currentLayer)
                    throw 'Failed to parse polygons: current layer is undefined';

                let cursor = chunkOffset + 4;
                while (cursor < chunkOffset + chunkSize) {
                    const verticesNumber = dataView.getInt16(cursor) & 0x03ff;
                    if (verticesNumber !== 3)
                        throw 'Unsupported number of vertices in polygon';
                    cursor += 2;

                    let result = readVx(dataView, cursor);
                    cursor += result.size;
                    const a = result.value;

                    result = readVx(dataView, cursor);
                    cursor += result.size;
                    const b = result.value;

                    result = readVx(dataView, cursor);
                    cursor += result.size;
                    const c = result.value;

                    const polygon = new LwoPolygon(a, b, c);
                    this.currentLayer.polygons.push(polygon);
                }
                break;
            default:
                console.warn('Unsupported polygon type '
                    + new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, 4))
                    + ' found at ' + chunkOffset);
        }
    }

    parseSurface(dataView, chunkOffset, chunkSize, buffer) {
        const material = new THREE.MeshPhongMaterial();
        this.materials.push(material);

        let offset = 0;
        while (dataView.getUint8(chunkOffset + offset) !== 0)
            offset++;
        material.name = new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, offset));

        while (offset < chunkSize) {
            const subchunkOffset = chunkOffset + offset;
            if (dataView.getUint8(subchunkOffset) === 0)
                offset++;
            else {
                const subchunkType = dataView.getInt32(subchunkOffset);
                const subchunkSize = dataView.getInt16(subchunkOffset + 4);

                switch (subchunkType) {
                    case CHUNK_TYPE_COLR:
                        const colorArray = [];
                        for (let i = 0; i < 4; i++)
                            colorArray.push(dataView.getUint8(subchunkOffset + SUBCHUNK_HEADER_SIZE + i) / 255);
                        const color = new THREE.Color().fromArray(colorArray);
                        material.color = color;
                        break;
                    case CHUNK_TYPE_VTRN:
                        let transparency;
                        if (subchunkType === CHUNK_TYPE_VTRN)
                            transparency = dataView.getFloat32(subchunkOffset + SUBCHUNK_HEADER_SIZE);
                        else
                            transparency = dataView.getInt16(subchunkOffset + SUBCHUNK_HEADER_SIZE) / 255;
                        material.opacity = 1 - transparency;
                        if (transparency > 0)
                            material.transparent = true;
                        break;
                    case CHUNK_TYPE_SPEC:
                    case CHUNK_TYPE_FLAG:
                    case CHUNK_TYPE_LUMI:
                    case CHUNK_TYPE_VLUM:
                    case CHUNK_TYPE_DIFF:
                    case CHUNK_TYPE_VDIF:
                    case CHUNK_TYPE_VSPC:
                    case CHUNK_TYPE_REFL:
                    case CHUNK_TYPE_TRAN:
                    case CHUNK_TYPE_TFLG:
                    case CHUNK_TYPE_TSIZ:
                    case CHUNK_TYPE_TCTR:
                    case CHUNK_TYPE_TIMG:
                    case CHUNK_TYPE_RIND:
                    case CHUNK_TYPE_GLOS:
                    case CHUNK_TYPE_SMAN:
                    case CHUNK_TYPE_BUMP:
                    case CHUNK_TYPE_TRNL:
                    case CHUNK_TYPE_BLOK:
                    case CHUNK_TYPE_VCOL:
                        break;
                    case 0x74657874: // "text" TODO: What the hell is this?
                        break;
                    default:
                        console.warn('Unsupported SURF subchunk type '
                            + new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset, 4))
                            + ' found at ' + subchunkOffset);
                }

                offset += SUBCHUNK_HEADER_SIZE + subchunkSize;
            }
        }
    }

    parseVertexMapping(dataView, chunkOffset, chunkSize, buffer, perPoly) {
        let cursor = chunkOffset;

        const type = dataView.getUint32(cursor);
        cursor += 4;

        switch (type) {
            case CHUNK_TYPE_TXUV:
                if (!this.currentLayer)
                    throw 'Failed to parse vertex mapping: current layer is undefined';

                const dimension = dataView.getInt16(cursor);
                cursor += 2;

                let result = readS0(dataView, cursor, buffer);
                const name = result.value;
                cursor += result.size;

                if (dimension !== 2) {
                    console.warn('Skipping UV channel "' + name + '" with unsupported dimension ' + dimension);
                    return;
                }

                let i = 0;
                const vertexMap = new VertexMap(perPoly);
                while (cursor < chunkOffset + chunkSize) {
                    result = readVx(dataView, cursor);
                    vertexMap.vindex[i] = result.value;
                    cursor += result.size;
                    if (perPoly) {
                        result = readVx(dataView, cursor);
                        vertexMap.pindex[i] = result.value;
                        cursor += result.size;
                    }
                    vertexMap.uvs[i] = [dataView.getFloat32(cursor), dataView.getFloat32(cursor + 4)];
                    cursor += 8;
                    i++;
                }
                this.currentLayer.vertexMaps.push(vertexMap);
                break;
            case CHUNK_TYPE_RGB:
            case CHUNK_TYPE_RGBA:
                break;
            default:
                console.warn('Unsupported VMAP subchunk type '
                    + new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, 4))
                    + ' found at ' + chunkOffset);
        }
    }

    parsePolygonTagMapping(dataView, chunkOffset, chunkSize, buffer) {
        const type = dataView.getUint32(chunkOffset);
        switch (type) {
            case CHUNK_TYPE_SURF:
                if (!this.currentLayer)
                    throw 'Failed to parse polygon-tag mapping: current layer is undefined';

                let cursor = chunkOffset + 4;
                while (cursor < chunkOffset + chunkSize) {
                    const result = readVx(dataView, cursor);
                    cursor += result.size;
                    const tag = dataView.getUint16(cursor);
                    cursor += 2;
                    const polygon = this.currentLayer.polygons[result.value];
                    if (polygon)
                        polygon.materialIndex = tag;
                    else
                        console.warn('Polygon is not found by index ' + result.value);
                }
                break;
            default:
                console.warn('Unsupported PTAG subchunk type '
                    + new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, 4))
                    + ' found at ' + chunkOffset);
        }
    }

    composeJson() {
        if (this.layers.length === 0)
            throw 'At least one layer must be present';
        let layer = this.layers[0];
        let idx = 0;
        while (idx < this.layers.length - 1 && !layer)
            layer = this.layers[++idx];

        const json = {
            scale: 1.0,
            vertices: [],
            faces: [],
            materials: [],
            uvs: [[]],
            metadata: {
                version: 3,
                faces: layer.polygons.length,
                materials: this.tags.length,
                vertices: layer.points.length,
                type: 'Geometry',
                uvs: 1,
                normals: 0
            }
        };

        for (let i = 0; i < layer.vertexMaps.length; i++) {
            const vertexMap = layer.vertexMaps[i];
            if (!vertexMap.perPoly)
                for (let j = 0; j < vertexMap.vindex.length; j++) {
                    const vertexIndex = vertexMap.vindex[j];
                    const uv = vertexMap.uvs[j];
                    json.uvs[0][vertexIndex * 2] = math.round(uv[0], 6);
                    json.uvs[0][vertexIndex * 2 + 1] = math.round(uv[1], 6);
                }
        }

        for (let i = 0; i < layer.vertexMaps.length; i++) {
            const vertexMap = layer.vertexMaps[i];
            if (vertexMap.perPoly)
                for (let j = 0; j < vertexMap.pindex.length; j++) {
                    const polygon = layer.polygons[vertexMap.pindex[j]];

                    if (vertexMap.vindex[j] === polygon.a) {
                        json.uvs[0].push(vertexMap.uvs[j][0]);
                        json.uvs[0].push(vertexMap.uvs[j][1]);
                        polygon.vertexUv.a = (json.uvs[0].length - 2) / 2;
                    }

                    if (vertexMap.vindex[j] === polygon.b) {
                        json.uvs[0].push(vertexMap.uvs[j][0]);
                        json.uvs[0].push(vertexMap.uvs[j][1]);
                        polygon.vertexUv.b = (json.uvs[0].length - 2) / 2;
                    }

                    if (vertexMap.vindex[j] === polygon.c) {
                        json.uvs[0].push(vertexMap.uvs[j][0]);
                        json.uvs[0].push(vertexMap.uvs[j][1]);
                        polygon.vertexUv.c = (json.uvs[0].length - 2) / 2;
                    }
                }
        }

        for (let i = 0; i < layer.points.length; i++) {
            const point = layer.points[i];
            json.vertices.push(math.round(point.x, 4));
            json.vertices.push(math.round(point.z, 4) * -1);
            json.vertices.push(math.round(point.y, 4) * -1);
        }

        for (let i = 0; i < layer.polygons.length; i++) {
            const polygon = layer.polygons[i];
            json.faces.push(10); // type
            json.faces.push(polygon.c, polygon.b, polygon.a);
            json.faces.push(polygon.materialIndex);
            json.faces.push(polygon.vertexUv.c === undefined ? polygon.c : polygon.vertexUv.c);
            json.faces.push(polygon.vertexUv.b === undefined ? polygon.b : polygon.vertexUv.b);
            json.faces.push(polygon.vertexUv.a === undefined ? polygon.a : polygon.vertexUv.a);
        }

        for (let i = 0; i < this.tags.length; i++) {
            const tag = this.tags[i];
            let materialFound = false;
            for (let j = 0; j < this.materials.length && !materialFound; j++) {
                const material = this.materials[j];
                if (material.name === tag) {
                    materialFound = true;
                    json.materials.push({
                        DbgIndex: i,
                        DbgName: material.name,
                        depthWrite: material.depthWrite,
                        depthTest: material.depthTest,
                        transparent: material.transparent,
                        opacity: material.opacity,
                        blending: 'NormalBlending',
                        wireframe: material.wireframe,
                        shading: 'phong',
                        visible: material.visible
                    });
                }
            }
            if (!materialFound)
                console.warn('Material corresponding to tag \"' + tag + '\" is not found');
        }

        return json;
    }
}

class Layer {
    constructor(name) {
        this.name = name;
        this.points = [];
        this.bbox = {min: null, max: null};
        this.vertexMaps = [];
        this.polygons = [];
    }
}

class VertexMap {
    constructor(perPoly) {
        this.perPoly = perPoly;
        this.vindex = [];
        this.pindex = [];
        this.uvs = [];
    }
}
