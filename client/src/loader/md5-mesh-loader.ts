import {FileLoader, Loader, LoadingManager, Quaternion, Vector2, Vector3} from 'three';

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
        return {joints: this.parseJoints(s), meshes: this.parseMeshes(s)};
    }

    private parseJoints(s: string): any[] {
        const result: any[] = [];
        s.replace(/joints {([^}]*)}/m, (_, joints) => {
            const jointRegExp = /"(\w+)"\s([-\d]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>joints).replace(jointRegExp, (_, name, parent, x, y, z, ox, oy, oz) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const ov = new Vector3(parseFloat(ox), parseFloat(oy), parseFloat(oz));
                const w = -Math.sqrt(Math.abs(1.0 - ov.x * ov.x - ov.y * ov.y - ov.z * ov.z));
                const orientation = new Quaternion(ov.x, ov.y, ov.z, w);
                result.push({name, parent, position, orientation});
                return _;
            });
            return _;
        });
        return result;
    }

    private parseMeshes(s: string): any[] {
        const result: any[] = [];
        s.replace(/mesh {([^}]*)}/mg, (_, mesh) => {
            let meshShader: string | undefined;
            const vertices: any[] = [];
            const faces: number[] = [];
            const weights: any[] = [];

            (<string>mesh).replace(/shader "(.+)"/, (_, shader) => {
                meshShader = shader;
                return _;
            });

            const verticesRegExp = /vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g;
            (<string>mesh).replace(verticesRegExp, (_, u, v, weightIndex, weightCount) => {
                const position = new Vector3(0, 0, 0);
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                const uv = new Vector2(parseFloat(u), parseFloat(v));
                const weight = {index: parseInt(weightIndex), count: parseInt(weightCount)};
                vertices.push({position, normal, tangent, uv, weight});
                return _;
            });

            (<string>mesh).replace(/tri \d+ (\d+) (\d+) (\d+)/g, (_, i1, i2, i3) => {
                faces.push(parseInt(i1), parseInt(i2), parseInt(i3));
                return _;
            });

            const weightsRegExp = /weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>mesh).replace(weightsRegExp, (_, joint, bias, x, y, z) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                weights.push({joint: parseInt(joint), bias: parseFloat(bias), position, normal, tangent});
                return _;
            });

            result.push({shader: meshShader, vertices, faces, weights, skinWeights: [], skinIndices: []});
            return _;
        });
        return result;
    }
}
