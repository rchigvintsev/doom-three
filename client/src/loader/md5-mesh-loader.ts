import {BufferAttribute, BufferGeometry, FileLoader, Loader, LoadingManager, Vector2, Vector3} from 'three';
import {round} from 'mathjs';

// noinspection JSMethodCanBeStatic
/**
 * Code for parsing of MD5 mesh is kindly borrowed from "MD5 to JSON Converter"
 * (http://oos.moxiecode.com/js_webgl/md5_converter) by @oosmoxiecode (https://twitter.com/oosmoxiecode).
 */
export class Md5MeshLoader extends Loader {
    private readonly fileLoader: FileLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(this.manager);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<any> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<string>content));
    }

    private parse(s: string): any {
        const meshes = this.parseMeshes(s);
        return {meshes, geometry: this.createGeometry(meshes)};
    }

    private parseMeshes(s: string): any[] {
        const meshes: {
            shader: string,
            vertices: { uv: Vector2, weight: { index: number, count: number } }[],
            faces: number[],
            weights: { joint: number; bias: number; position: Vector3 }[]
        }[] = [];
        s.replace(/mesh {([^}]*)}/mg, (_, mesh) => {
            const shader = this.parseShader(mesh);
            const vertices = this.parseVertices(mesh);
            const faces = this.parseFaces(mesh);
            const weights = this.parseWeights(mesh);
            meshes.push({shader, vertices, faces, weights});
            return _;
        });
        return meshes;
    }

    private parseShader(mesh: string): string {
        const result: string[] = [];
        mesh.replace(/shader "(.+)"/, (_, shader) => {
            result.push(shader);
            return _;
        });
        return result[0];
    }

    private parseVertices(mesh: string): { uv: Vector2, weight: { index: number, count: number } }[] {
        const vertices: { uv: Vector2, weight: { index: number, count: number } }[] = [];
        const verticesRegExp = /vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g;
        mesh.replace(verticesRegExp, (_, u, v, weightIndex, weightCount) => {
            const uv = new Vector2(round(parseFloat(u), 3), round(1.0 - parseFloat(v), 3));
            const weight = {index: parseInt(weightIndex), count: parseInt(weightCount)};
            vertices.push({uv, weight});
            return _;
        });
        return vertices;
    }

    private parseFaces(mesh: string): number[] {
        const faces: number[] = [];
        mesh.replace(/tri \d+ (\d+) (\d+) (\d+)/g, (_, i1, i2, i3) => {
            faces.push(parseInt(i1), parseInt(i2), parseInt(i3));
            return _;
        });
        return faces;
    }

    private parseWeights(mesh: string): { joint: number; bias: number; position: Vector3 }[] {
        const weights: { joint: number, bias: number, position: Vector3 }[] = [];
        const weightsRegExp = /weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
        mesh.replace(weightsRegExp, (_, joint, bias, x, y, z) => {
            const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
            weights.push({joint: parseInt(joint), bias: parseFloat(bias), position});
            return _;
        });
        return weights;
    }

    private createGeometry(meshes: {
        shader: string,
        vertices: { uv: Vector2, weight: { index: number, count: number } }[],
        faces: number[],
        weights: { joint: number; bias: number; position: Vector3 }[]
    }[]): BufferGeometry {
        let vertexCount = 0;
        let weightCount = 0;

        const vertexWeights: number[] = [];
        const weights: number[] = [];
        const faces: { a: number, b: number, c: number, materialIndex: number }[] = [];
        const uvs: Vector2[] = [];
        const groups: { start: number; count: number; materialIndex?: number }[] = [];
        const materials: string[] = [];

        for (let m = 0; m < meshes.length; m++) {
            const mesh = meshes[m];

            for (let i = 0; i < mesh.vertices.length; i++) {
                const vertex = mesh.vertices[i];
                vertexWeights.push(vertex.weight.index + weightCount, vertex.weight.count);
            }

            for (let i = 0; i < mesh.faces.length; i += 3) {
                const a = mesh.faces[i] + vertexCount;
                const b = mesh.faces[i + 2] + vertexCount;
                const c = mesh.faces[i + 1] + vertexCount;
                faces.push({a, b, c, materialIndex: m});
            }

            vertexCount += mesh.vertices.length;

            for (let i = 0; i < mesh.weights.length; i++) {
                const weightPosition = mesh.weights[i].position;
                weights.push(mesh.weights[i].joint, mesh.weights[i].bias,
                    weightPosition.x, weightPosition.y, weightPosition.z);
            }
            weightCount += mesh.weights.length;

            if (mesh.shader) {
                materials[m] = mesh.shader;
            }
        }

        let materialIndex = undefined;
        let group: { start: number; count: number; materialIndex?: number } | undefined = undefined;

        let i = 0;
        for (; i < faces.length; i++) {
            const face = faces[i];

            if (face.materialIndex !== materialIndex) {
                materialIndex = face.materialIndex;
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

            for (let j = 0; j < 3; j++) {
                const uvIdx = j === 0 ? face.a : (j === 1 ? face.b : face.c);
                uvs.push(meshes[face.materialIndex].vertices[uvIdx].uv);
            }
        }

        if (group) {
            group.count = (i * 3) - group.start;
            groups.push(group);
        }

        const geometry = new BufferGeometry();
        const positionCount = new BufferAttribute(new Uint32Array(1), 1).copyArray([vertexCount]);
        geometry.setAttribute('positionCount', positionCount);
        if (vertexWeights.length > 0) {
            const positionWeight = new BufferAttribute(new Float32Array(vertexWeights.length), 2)
                .copyArray(vertexWeights);
            geometry.setAttribute('positionWeight', positionWeight);
        }
        if (weights.length) {
            const weight = new BufferAttribute(new Float32Array(weights.length), 1).copyArray(weights);
            geometry.setAttribute('weight', weight);
        }
        if (uvs.length > 0) {
            const uv = new BufferAttribute(new Float32Array(uvs.length * 2), 2).copyVector2sArray(uvs);
            geometry.setAttribute('uv', uv);
        }
        geometry.groups = groups;
        return geometry;
    }
}
