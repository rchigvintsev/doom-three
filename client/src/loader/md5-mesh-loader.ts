import {FileLoader, Loader, LoadingManager, MeshPhongMaterial, SkinnedMesh, Vector2, Vector3} from 'three';

import {round} from 'mathjs';

import {Md5MeshFace, Md5MeshGeometry, Md5MeshVertex, Md5MeshWeight} from '../geometry/md5-mesh-geometry';

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

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<SkinnedMesh> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<string>content));
    }

    private parse(s: string): SkinnedMesh {
        const faces: Md5MeshFace[] = [];
        const vertices: Md5MeshVertex[] = [];
        const weights: Md5MeshWeight[] = [];
        const shaders: string[] = [];

        let materialIndex = 0;
        let vertexCount = 0;
        let weightCount = 0;

        s.replace(/mesh {([^}]*)}/mg, (_, mesh) => {
            this.parseFaces(mesh, faces, materialIndex, vertexCount);
            vertexCount += this.parseVertices(mesh, vertices, weightCount);
            weightCount += this.parseWeights(mesh, weights);
            this.parseShader(mesh, shaders);
            materialIndex++;
            return _;
        });

        return this.createSkinnedMesh(faces, vertices, weights, shaders);
    }

    private parseFaces(mesh: string, faces: Md5MeshFace[], materialIndex: number, totalVertexCount: number) {
        mesh.replace(/tri \d+ (\d+) (\d+) (\d+)/g, (_, i1, i2, i3) => {
            const a = parseInt(i1) + totalVertexCount;
            const b = parseInt(i3) + totalVertexCount;
            const c = parseInt(i2) + totalVertexCount;
            faces.push(new Md5MeshFace(a, b, c, materialIndex));
            return _;
        });
    }

    private parseVertices(mesh: string, vertices: Md5MeshVertex[], totalWeightCount: number): number {
        let vertexCount = 0;
        const verticesRegExp = /vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g;
        mesh.replace(verticesRegExp, (_, u, v, weightIndex, weightCount) => {
            const uv = new Vector2(round(parseFloat(u), 3), round(1.0 - parseFloat(v), 3));
            vertices.push(new Md5MeshVertex(uv, parseInt(weightIndex) + totalWeightCount, parseInt(weightCount)));
            vertexCount++;
            return _;
        });
        return vertexCount;
    }

    private parseWeights(mesh: string, weights: Md5MeshWeight[]): number {
        let weightCount = 0;
        const weightsRegExp = /weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
        mesh.replace(weightsRegExp, (_, joint, bias, x, y, z) => {
            const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
            weights.push(new Md5MeshWeight(parseInt(joint), parseFloat(bias), position));
            weightCount++;
            return _;
        });
        return weightCount;
    }

    private parseShader(mesh: string, shaders: string[]) {
        mesh.replace(/shader "(.+)"/, (_, shader) => {
            shaders.push(shader);
            return _;
        });
    }

    private createSkinnedMesh(faces: Md5MeshFace[],
                              vertices: Md5MeshVertex[],
                              weights: Md5MeshWeight[],
                              shaders: string[]): SkinnedMesh {
        let materialIndex = undefined;
        let group: { start: number, count: number, materialIndex?: number } | undefined = undefined;
        const groups: { start: number, count: number, materialIndex?: number }[] = [];

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
        }

        if (group) {
            group.count = (i * 3) - group.start;
            groups.push(group);
        }

        const geometry = new Md5MeshGeometry(faces, vertices, weights);
        geometry.groups = groups;
        const materials = shaders.map(shader => new MeshPhongMaterial({name: shader}));
        return new SkinnedMesh(geometry, materials);
    }
}
