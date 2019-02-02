var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    var TYPE_LWO2 = 0x4c574f32;

    var CHUNK_TYPE_FORM = 0x464f524d;
    var CHUNK_TYPE_PNTS = 0x504e5453;
    var CHUNK_TYPE_POLS = 0x504f4c53;
    var CHUNK_TYPE_SURF = 0x53555246;
    var CHUNK_TYPE_TAGS = 0x54414753;
    var CHUNK_TYPE_LAYR = 0x4c415952;
    var CHUNK_TYPE_BBOX = 0x42424f58;
    var CHUNK_TYPE_VMAP = 0x564d4150;
    var CHUNK_TYPE_PTAG = 0x50544147;
    var CHUNK_TYPE_VMAD = 0x564d4144;
    var CHUNK_TYPE_CLIP = 0x434c4950;
    var CHUNK_TYPE_TXUV = 0x54585556;
    var CHUNK_TYPE_TFLG = 0x54464c47;
    var CHUNK_TYPE_TSIZ = 0x5453495a;
    var CHUNK_TYPE_TCTR = 0x54435452;
    var CHUNK_TYPE_COLR = 0x434f4c52;
    var CHUNK_TYPE_LUMI = 0x4c554d49;
    var CHUNK_TYPE_FLAG = 0x464c4147;
    var CHUNK_TYPE_DIFF = 0x44494646;
    var CHUNK_TYPE_SPEC = 0x53504543;
    var CHUNK_TYPE_REFL = 0x5245464c;
    var CHUNK_TYPE_TRAN = 0x5452414e;
    var CHUNK_TYPE_VLUM = 0x564c554d;
    var CHUNK_TYPE_VDIF = 0x56444946;
    var CHUNK_TYPE_VSPC = 0x56535043;
    var CHUNK_TYPE_VTRN = 0x5654524e;
    var CHUNK_TYPE_TIMG = 0x54494d47;
    var CHUNK_TYPE_RIND = 0x52494e44;
    var CHUNK_TYPE_GLOS = 0x474c4f53;
    var CHUNK_TYPE_SMAN = 0x534d414e;
    var CHUNK_TYPE_BUMP = 0x42554d50;
    var CHUNK_TYPE_TRNL = 0x54524e4c;
    var CHUNK_TYPE_BLOK = 0x424c4f4b;
    var CHUNK_TYPE_FACE = 0x46414345;

    var CHUNK_HEADER_SIZE    = 8;
    var SUBCHUNK_HEADER_SIZE = 6;

    function readS0(dataView, offset, buffer) {
        var cursor = offset;
        while (dataView.getUint8(cursor) !== 0)
            cursor++;
        if (cursor > offset) {
            var length = cursor - offset;
            return {value: new TextDecoder().decode(new Uint8Array(buffer, offset, length)), size: length};
        }
        return {size: 0};
    }

    function readVx(dataView, offset) {
        var index, size;
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

    DT.LWOLoader = function (manager) {
        this._fileLoader = new THREE.FileLoader(manager);
        this._fileLoader.setResponseType('arraybuffer');
        this._jsonLoader = new THREE.JSONLoader(manager);
    };

    DT.LWOLoader.prototype = {
        constructor: DT.LWOLoader,

        load: function (model, onLoad, onProgress, onError) {
            if (!onLoad)
                return this.parse(model);
            var scope = this;
            this._fileLoader.load(model, function (buffer) {
                onLoad(scope.parse(buffer));
            }, onProgress, onError);
        },

        parse: function (buffer) {
            var dataView = new DataView(buffer);

            if (dataView.getUint32(0) !== CHUNK_TYPE_FORM)
                throw 'Failed to find LWO header';

            var typeOffset = CHUNK_HEADER_SIZE;
            if (dataView.getUint32(typeOffset) !== TYPE_LWO2) {
                var type = new TextDecoder().decode(new Uint8Array(buffer, typeOffset, 4));
                throw 'Unsupported type: ' + type;
            }

            this.tags = [];
            this.materials = [];
            this.layers = [];
            this.currentLayer = null;

            var cursor = CHUNK_HEADER_SIZE + 4;
            while (cursor < dataView.byteLength) {
                if (dataView.getUint8(cursor) === 0)
                    cursor++;
                else {
                    var chunkType = dataView.getInt32(cursor);
                    var chunkSize = dataView.getInt32(cursor + 4);

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

            var geomAndMat = this._jsonLoader.parse(this.composeJson());
            geomAndMat.geometry.computeFaceNormals();
            geomAndMat.geometry.computeVertexNormals();
            return geomAndMat;
        },

        parseTags: function (dataView, chunkOffset, chunkSize, buffer) {
            var cursor = chunkOffset;
            while (cursor < chunkOffset + chunkSize) {
                var result = readS0(dataView, cursor, buffer);
                if (result.size > 0)
                    this.tags.push(result.value);
                cursor += result.size + 1;
            }
        },

        parseLayer: function (dataView, chunkOffset, chunkSize, buffer) {
            var cursor = chunkOffset;
            var index = dataView.getUint16(cursor);
            cursor += 16; // index (2) + flags (2) + pivot (4 * 3)
            var name = readS0(dataView, cursor, buffer).value;
            this.layers[index] = this.currentLayer = new Layer(name);
        },

        parsePoints: function (dataView, chunkOffset, chunkSize) {
            if (chunkSize % 12 !== 0)
                throw 'Points chunk length (' + chunkSize + ') is not multiple of vertex length';
            if (!this.currentLayer)
                throw 'Failed to parse points: current layer is undefined';
            var pointsNumber = chunkSize / 12;
            for (var i = 0; i < pointsNumber; i++) {
                var pointOffset = i * 12;
                var x = dataView.getFloat32(chunkOffset + pointOffset);
                var y = dataView.getFloat32(chunkOffset + pointOffset + 4);
                var z = dataView.getFloat32(chunkOffset + pointOffset + 8);
                var point = new THREE.Vector3(x, y, z);
                this.currentLayer.points.push(point);
            }
        },

        parseBoundingBox: function (dataView, chunkOffset) {
            if (!this.currentLayer)
                throw 'Failed to parse bounding box: current layer is undefined';
            var cursor = chunkOffset;

            var min = [];
            for (var i = 0; i < 3; i++) {
                min.push(dataView.getFloat32(cursor));
                cursor += 4;
            }
            this.currentLayer.bbox.min = new THREE.Vector3().fromArray(min);

            var max = [];
            for (i = 0; i < 3; i++) {
                max.push(dataView.getFloat32(cursor));
                cursor += 4;
            }
            this.currentLayer.bbox.max = new THREE.Vector3().fromArray(max);
        },

        parsePolygons: function (dataView, chunkOffset, chunkSize, buffer) {
            var type = dataView.getInt32(chunkOffset);
            switch (type) {
                case CHUNK_TYPE_FACE:
                    if (!this.currentLayer)
                        throw 'Failed to parse polygons: current layer is undefined';

                    var cursor = chunkOffset + 4;
                    while (cursor < chunkOffset + chunkSize) {
                        var verticesNumber = dataView.getInt16(cursor) & 0x03ff;
                        if (verticesNumber !== 3)
                            throw 'Unsupported number of vertices in polygon';
                        cursor += 2;

                        var result = readVx(dataView, cursor);
                        cursor += result.size;
                        var a = result.value;

                        result = readVx(dataView, cursor);
                        cursor += result.size;
                        var b = result.value;

                        result = readVx(dataView, cursor);
                        cursor += result.size;
                        var c = result.value;

                        var polygon = new THREE.Face3(a, b, c);
                        polygon.vertexUv = {};
                        this.currentLayer.polygons.push(polygon);
                    }
                    break;
                default:
                    console.warn('Unsupported polygon type '
                        + new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, 4))
                        + ' found at ' + chunkOffset);
            }
        },

        parseSurface: function (dataView, chunkOffset, chunkSize, buffer) {
            var material = new THREE.MeshPhongMaterial();
            this.materials.push(material);

            var offset = 0;
            while (dataView.getUint8(chunkOffset + offset) !== 0)
                offset++;
            material.name = new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, offset));

            while (offset < chunkSize) {
                var subchunkOffset = chunkOffset + offset;
                if (dataView.getUint8(subchunkOffset) === 0)
                    offset++;
                else {
                    var subchunkType = dataView.getInt32(subchunkOffset);
                    var subchunkSize = dataView.getInt16(subchunkOffset + 4);

                    switch (subchunkType) {
                        case CHUNK_TYPE_COLR:
                            var colorArray = [];
                            for (var i = 0; i < 4; i++)
                                colorArray.push(dataView.getUint8(subchunkOffset + SUBCHUNK_HEADER_SIZE + i) / 255);
                            var color = new THREE.Color().fromArray(colorArray);
                            material.color = color;
                            break;
                        case CHUNK_TYPE_VTRN:
                            var transparency;
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
                            break;
                        default:
                            console.warn('Unsupported SURF subchunk type '
                                + new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset, 4))
                                + ' found at ' + subchunkOffset);
                    }

                    offset += SUBCHUNK_HEADER_SIZE + subchunkSize;
                }
            }
        },

        parseVertexMapping: function (dataView, chunkOffset, chunkSize, buffer, perPoly) {
            var cursor = chunkOffset;

            var type = dataView.getUint32(cursor);
            cursor += 4;

            switch (type) {
                case CHUNK_TYPE_TXUV:
                    if (!this.currentLayer)
                        throw 'Failed to parse vertex mapping: current layer is undefined';

                    var dimension = dataView.getInt16(cursor);
                    cursor += 2;

                    var result = readS0(dataView, cursor, buffer);
                    var name = result.value;
                    cursor += result.size + 2;

                    if (dimension !== 2) {
                        console.warn('Skipping UV channel "' + name + '" with unsupported dimension ' + dimension);
                        return;
                    }

                    var i = 0;
                    var vertexMap = new VertexMap(perPoly);
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
                default:
                    console.warn('Unsupported VMAP subchunk type '
                        + new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, 4))
                        + ' found at ' + chunkOffset);
            }
        },

        parsePolygonTagMapping: function (dataView, chunkOffset, chunkSize, buffer) {
            var type = dataView.getUint32(chunkOffset);
            switch (type) {
                case CHUNK_TYPE_SURF:
                    if (!this.currentLayer)
                        throw 'Failed to parse polygon-tag mapping: current layer is undefined';

                    var cursor = chunkOffset + 4;
                    while (cursor < chunkOffset + chunkSize) {
                        var result = readVx(dataView, cursor);
                        cursor += result.size;
                        var tag = dataView.getUint16(cursor);
                        cursor += 2;
                        var polygon = this.currentLayer.polygons[result.value];
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
        },

        composeJson: function () {
            if (this.layers.length === 0)
                throw 'At least one layer must be present';
            var layer = this.layers[0];

            var json = {
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

            for (var i = 0; i < layer.vertexMaps.length; i++) {
                var vertexMap = layer.vertexMaps[i];
                if (!vertexMap.perPoly)
                    for (var j = 0; j < vertexMap.vindex.length; j++) {
                        var vertexIndex = vertexMap.vindex[j];
                        var uv = vertexMap.uvs[j];
                        json.uvs[0][vertexIndex * 2] = math.round(uv[0], 6);
                        json.uvs[0][vertexIndex * 2 + 1] = math.round(uv[1], 6);
                    }
            }

            for (i = 0; i < layer.vertexMaps.length; i++) {
                vertexMap = layer.vertexMaps[i];
                if (vertexMap.perPoly)
                    for (j = 0; j < vertexMap.pindex.length; j++) {
                        var polygon = layer.polygons[vertexMap.pindex[j]];

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

            for (i = 0; i < layer.points.length; i++) {
                var point = layer.points[i];
                json.vertices.push(math.round(point.x, 4));
                json.vertices.push(math.round(point.z, 4) * -1);
                json.vertices.push(math.round(point.y, 4) * -1);
            }

            for (i = 0; i < layer.polygons.length; i++) {
                polygon = layer.polygons[i];
                json.faces.push(10); // type
                json.faces.push(polygon.c, polygon.b, polygon.a);
                json.faces.push(polygon.materialIndex);
                json.faces.push(polygon.vertexUv.c == undefined ? polygon.c : polygon.vertexUv.c);
                json.faces.push(polygon.vertexUv.b == undefined ? polygon.b : polygon.vertexUv.b);
                json.faces.push(polygon.vertexUv.a == undefined ? polygon.a : polygon.vertexUv.a);
            }

            for (i = 0; i < this.tags.length; i++) {
                var tag = this.tags[i];
                var materialFound = false;
                for (j = 0; j < this.materials.length && !materialFound; j++) {
                    var material = this.materials[j];
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
    };

    var Layer = function (name) {
        this.name = name;
        this.points = [];
        this.bbox = {min: null, max: null};
        this.vertexMaps = [];
        this.polygons = [];
    };
    Layer.prototype = {constructor: Layer};

    var VertexMap = function (perPoly) {
        this.perPoly = perPoly;
        this.vindex = [];
        this.pindex = [];
        this.uvs = [];
    };
    VertexMap.prototype = {constructor: VertexMap};
})(DOOM_THREE);

export const LWOLoader = DOOM_THREE.LWOLoader;
