import {JSONLoader} from './json-loader.js';

/**
 * Most of the code in this script is kindly borrowed from "MD5 to JSON Converter"
 * (http://oos.moxiecode.com/js_webgl/md5_converter) by @oosmoxiecode (https://twitter.com/oosmoxiecode).
 */
export class MD5Loader {
    constructor(manager) {
        this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
    }

    load(model, animations, onLoad, onProgress, onError) {
        if (!onLoad) {
            return this.parse(model, animations);
        }

        const fileLoader = new THREE.FileLoader(this.manager);
        fileLoader.load(model, (meshContent) => {
            const animationContents = [];
            for (let i = 0; i < animations.length; i++) {
                fileLoader.load(animations[i], (animationContent) => {
                    animationContents.push(animationContent);
                    if (animationContents.length === animations.length) {
                        onLoad(this.parse(meshContent, animationContents));
                    }
                }, onProgress, onError);
            }
        }, onProgress, onError);
    }

    parse(md5Mesh, md5Animations) {
        const md5MeshDefinition = this.parseMesh(md5Mesh);
        const md5AnimationDefinitions = [];
        for (let i = 0; i < md5Animations.length; i++) {
            md5AnimationDefinitions.push(this.parseAnimation(md5Animations[i]));
        }
        this.bindPose(md5MeshDefinition, md5AnimationDefinitions[0]);
        const result = this.compose(md5MeshDefinition, md5AnimationDefinitions);
        const geomAndMat = new JSONLoader().parse(result);
        geomAndMat.geometry.computeFaceNormals();
        geomAndMat.geometry.computeVertexNormals();
        return geomAndMat;
    }

    parseMesh(s) {
        return {joints: this.parseJoints(s), meshes: this.parseMeshes(s)};
    }

    parseAnimation(s) {
        const frameRate = this.parseFrameRate(s);
        return {
            name: this.parseAnimationName(s),
            frameRate: frameRate,
            frameTime: 1000 / frameRate,
            hierarchy: this.parseHierarchy(s),
            baseFrames: this.parseBaseFrames(s),
            frames: this.parseFrames(s)
        };
    }

    parseJoints(s) {
        const result = [];
        s.replace(/joints {([^}]*)}/m, ($0, joints) => {
            joints.replace(/"(\w+)"\s([-\d]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g,
                ($0, name, parent, x, y, z, ox, oy, oz) => {
                    ox = parseFloat(ox);
                    oy = parseFloat(oy);
                    oz = parseFloat(oz);
                    const w = -Math.sqrt(Math.abs(1.0 - ox * ox - oy * oy - oz * oz));
                    result.push({
                        name: name,
                        parent: parseInt(parent),
                        position: new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)),
                        orientation: new THREE.Quaternion(ox, oy, oz, w)
                    });
                });
        });
        return result;
    }

    parseMeshes(s) {
        const result = [];
        s.replace(/mesh {([^}]*)}/mg, ($0, mesh) => {
            const meshDefinition = {vertices: [], faces: [], weights: [], elementsNumber: 0};

            mesh.replace(/shader "(.+)"/, ($0, shader) => {
                meshDefinition.shader = shader;
            });

            mesh.replace(/vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g,
                ($0, u, v, weightIndex, weightCount) => {
                    meshDefinition.vertices.push({
                        position: new THREE.Vector3(0, 0, 0),
                        normal: new THREE.Vector3(0, 0, 0),
                        tangent: new THREE.Vector3(0, 0, 0),
                        uv: new THREE.Vector2(parseFloat(u), parseFloat(v)),
                        weight: {index: parseInt(weightIndex), count: parseInt(weightCount)}
                    });
                });

            mesh.replace(/tri \d+ (\d+) (\d+) (\d+)/g, ($0, i1, i2, i3) => {
                meshDefinition.faces.push(parseInt(i1));
                meshDefinition.faces.push(parseInt(i2));
                meshDefinition.faces.push(parseInt(i3));
            });
            meshDefinition.elementsNumber = meshDefinition.faces.length;

            mesh.replace(/weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g,
                ($0, joint, bias, x, y, z) => {
                    meshDefinition.weights.push({
                        joint: parseInt(joint),
                        bias: parseFloat(bias),
                        position: new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)),
                        normal: new THREE.Vector3(0, 0, 0),
                        tangent: new THREE.Vector3(0, 0, 0)
                    });
                });

            result.push(meshDefinition);
        });
        return result;
    }

    parseAnimationName(s) {
        let result = 'default';
        s.replace(/\/([\w]+)\.md5anim/, ($0, animationName) => {
            result = animationName;
        });
        return result;
    }

    parseFrameRate(s) {
        let result = 24;
        s.replace(/frameRate (\d+)/, ($0, frameRate) => {
            result = parseInt(frameRate);
        });
        return result;
    }

    parseHierarchy(s) {
        const result = [];
        s.replace(/hierarchy {([^}]*)}/m, ($0, hierarchy) => {
            hierarchy.replace(/"(.+)"\s([-\d]+) (\d+) (\d+)/g, ($0, name, parent, flags, index) => {
                result.push({
                    name: name,
                    parent: parseInt(parent),
                    flags: parseInt(flags),
                    index: parseInt(index)
                });
            });
        });
        return result;
    }

    parseBaseFrames(s) {
        const result = [];
        s.replace(/baseframe {([^}]*)}/m, ($0, baseFrames) => {
            baseFrames.replace(/\( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g,
                ($0, x, y, z, ox, oy, oz) => {
                    result.push({
                        position: new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z)),
                        orientation: new THREE.Quaternion(parseFloat(ox), parseFloat(oy), parseFloat(oz), 0)
                    });
                });
        });
        return result;
    }

    parseFrames(s) {
        const result = [];
        s.replace(/frame \d+ {([^}]*)}/mg, ($0, frames) => {
            const frame = [];
            frames.replace(/([-\d.]+)/g, ($0, value) => {
                frame.push(parseFloat(value));
            });
            result.push(frame);
        });
        return result;
    }

    bindPose(meshDefinition, animationDefinition) {
        const rotatedPosition = new THREE.Vector3(0, 0, 0);
        meshDefinition.skinWeights = [];
        meshDefinition.skinIndices = [];
        const frame0 = this.getFrame(animationDefinition, 0, true);
        for (let m = 0; m < meshDefinition.meshes.length; m++) {
            const mesh = meshDefinition.meshes[m];
            for (let v = 0; v < mesh.vertices.length; v++) {
                const vertex = mesh.vertices[v];
                vertex.position = new THREE.Vector3(0, 0, 0);
                for (let w = 0; w < vertex.weight.count; w++) {
                    const weight = mesh.weights[vertex.weight.index + w];
                    const joint = frame0[weight.joint];
                    if (w === 0) {
                        const heavyBones = this.findTwoHeaviestWeights(vertex, mesh);

                        meshDefinition.skinWeights.push(math.round(heavyBones[0].bias, 3));
                        meshDefinition.skinWeights.push(math.round(heavyBones[1].bias, 3));

                        meshDefinition.skinIndices.push(heavyBones[0].joint);
                        meshDefinition.skinIndices.push(heavyBones[1].joint);
                    }
                    rotatedPosition.copy(weight.position).applyQuaternion(joint.orientation);

                    vertex.position.x += (joint.position.x + rotatedPosition.x) * weight.bias;
                    vertex.position.y += (joint.position.y + rotatedPosition.y) * weight.bias;
                    vertex.position.z += (joint.position.z + rotatedPosition.z) * weight.bias;
                }
            }
        }
    }

    getFrame(animationDefinition, frameIndex, poseBinding) {
        const frame = animationDefinition.frames[frameIndex];
        const joints = [];
        for (let i = 0; i < animationDefinition.baseFrames.length; i++) {
            const baseJoint = animationDefinition.baseFrames[i];
            const offset = animationDefinition.hierarchy[i].index;
            const flags = animationDefinition.hierarchy[i].flags;

            const position = new THREE.Vector3().copy(baseJoint.position);
            const orientation = new THREE.Quaternion().copy(baseJoint.orientation);

            let j = 0;

            if (flags & 1) {
                position.x = frame[offset + j];
                j++;
            }
            if (flags & 2) {
                position.y = frame[offset + j];
                j++;
            }
            if (flags & 4) {
                position.z = frame[offset + j];
                j++;
            }
            if (flags & 8) {
                orientation.x = frame[offset + j];
                j++;
            }
            if (flags & 16) {
                orientation.y = frame[offset + j];
                j++;
            }
            if (flags & 32) {
                orientation.z = frame[offset + j];
                j++;
            }

            orientation.w = -Math.sqrt(Math.abs(1.0 - orientation.x * orientation.x
                - orientation.y * orientation.y - orientation.z * orientation.z));

            const parentIndex = animationDefinition.hierarchy[i].parent;
            if (parentIndex >= 0 && poseBinding) {
                const parentJoint = joints[parentIndex];
                position.applyQuaternion(parentJoint.orientation);
                position.add(parentJoint.position);
                orientation.multiplyQuaternions(parentJoint.orientation, orientation);
            }

            joints.push({position: position, orientation: orientation});
        }

        return joints;
    }

    findTwoHeaviestWeights(vertex, mesh) {
        const result = [{bias: 0, joint: 0}, {bias: 0, joint: 0}];

        let weight, firstHighestWeight = 0, firstHighestJoint = 0;

        for (let i = 0; i < vertex.weight.count; i++) {
            weight = mesh.weights[vertex.weight.index + i];
            if (weight.bias > firstHighestWeight) {
                firstHighestWeight = weight.bias;
                firstHighestJoint = weight.joint;
            }
        }

        result[0].bias = firstHighestWeight;
        result[0].joint = firstHighestJoint;

        if (vertex.weight.count > 1) {
            let secondHighestWeight = 0, secondHighestJoint = 0;

            for (let j = 0; j < vertex.weight.count; j++) {
                weight = mesh.weights[vertex.weight.index + j];
                if (weight.bias > secondHighestWeight && weight.joint !== firstHighestJoint) {
                    secondHighestWeight = weight.bias;
                    secondHighestJoint = weight.joint;
                }
            }

            result[1].bias = secondHighestWeight;
            result[1].joint = secondHighestJoint;
        }

        if (vertex.weight.count > 2) {
            const sum = result[0].bias + result[1].bias;
            result[0].bias = result[0].bias / sum;
            result[1].bias = result[1].bias / sum;
        }

        return result;
    }

    compose(meshDefinition, animationDefinitions) {
        const vertices = [];
        const faces = [];
        const uvs = [];
        const materials = [];

        let vertexCount = 0, faceCount = 0;

        for (let m = 0; m < meshDefinition.meshes.length; m++) {
            const mesh = meshDefinition.meshes[m];
            for (let v = 0; v < mesh.vertices.length; v++) {
                const vertex = mesh.vertices[v];
                const vertexPosition = vertex.position;

                vertices.push(math.round(vertexPosition.x, 3));
                vertices.push(math.round(vertexPosition.y, 3));
                vertices.push(math.round(vertexPosition.z, 3));

                uvs.push(math.round(vertex.uv.x, 3));
                uvs.push(math.round(1.0 - vertex.uv.y, 3));
            }

            for (let f = 0; f < mesh.faces.length; f += 3) {
                faces.push(10);
                faces.push(mesh.faces[f] + vertexCount);
                faces.push(mesh.faces[f + 2] + vertexCount);
                faces.push(mesh.faces[f + 1] + vertexCount);

                faces.push(m);

                faces.push(mesh.faces[f] + vertexCount);
                faces.push(mesh.faces[f + 2] + vertexCount);
                faces.push(mesh.faces[f + 1] + vertexCount);
            }

            vertexCount += mesh.vertices.length;
            faceCount += mesh.faces.length / 3;

            const materialName = encodeURI(mesh.shader);
            materials[m] = {DbgColor: 15658734, DbgIndex: m, DbgName: materialName};
        }

        const frame0 = this.getFrame(animationDefinitions[0], 0);
        const bonesJson = [];
        for (let bf = 0; bf < animationDefinitions[0].baseFrames.length; bf++) {
            const framePosition = frame0[bf].position;
            const frameOrientation = frame0[bf].orientation;
            bonesJson.push({
                parent: animationDefinitions[0].hierarchy[bf].parent,
                name: animationDefinitions[0].hierarchy[bf].name,
                pos: [math.round(framePosition.x, 6), math.round(framePosition.y, 6),
                    math.round(framePosition.z, 6)],
                rotq: [math.round(frameOrientation.x, 6), math.round(frameOrientation.y, 6),
                    math.round(frameOrientation.z, 6), math.round(frameOrientation.w, 6)]
            });
        }

        const animations = [];
        for (let i = 0; i < animationDefinitions.length; i++) {
            animations.push(this.composeAnimation(animationDefinitions[i]));
        }

        return {
            metadata: {
                formatVersion: 3.1,
                description: 'MD5 model converted from .md5mesh file using MD5 to JSON converter'
            },
            scale: 1.0,
            materials: materials,
            vertices: vertices,
            uvs: [uvs],
            faces: faces,
            bones: bonesJson,
            skinIndices: meshDefinition.skinIndices,
            skinWeights: meshDefinition.skinWeights,
            animations: animations
        };
    }

    composeAnimation(animationDefinition) {
        const animationLength = ((animationDefinition.frames.length - 1) * animationDefinition.frameTime) / 1000;
        const animationFps = animationDefinition.frameRate;

        const hierarchyJson = [];

        for (let h = 0; h < animationDefinition.hierarchy.length; h++) {
            const bone = animationDefinition.hierarchy[h];
            const boneJson = {parent: bone.parent, keys: []};

            for (let fr = 0; fr < animationDefinition.frames.length; fr++) {
                const frame = this.getFrame(animationDefinition, fr);
                const position = frame[h].position;
                const rotation = frame[h].orientation;
                const time = (animationDefinition.frameTime * fr) / 1000;

                const boneKeyJson = {
                    time: time,
                    pos: [math.round(position.x, 6), math.round(position.y, 6), math.round(position.z, 6)],
                    rot: [math.round(rotation.x, 6), math.round(rotation.y, 6), math.round(rotation.z, 6),
                        math.round(rotation.w, 6)]
                };
                boneJson.keys.push(boneKeyJson);

                if (fr === 0 || fr === animationDefinition.frames.length - 1) {
                    boneKeyJson.scl = [1, 1, 1];
                }
            }

            hierarchyJson.push(boneJson);
        }

        return {
            name: animationDefinition.name,
            length: animationLength,
            fps: animationFps,
            hierarchy: hierarchyJson
        }
    }
}
