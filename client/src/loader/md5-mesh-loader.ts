import {FileLoader, Loader, LoadingManager, Quaternion, Vector2, Vector3} from 'three';

import {JsonLoader} from './json-loader';
import {Md5Mesh, Md5MeshJoint, Md5MeshVertex, Md5MeshWeight, Md5MeshVertexWeight} from '../entity/md5model/md5-mesh';

/**
 * Code for parsing of MD5 mesh is kindly borrowed from "MD5 to JSON Converter"
 * (http://oos.moxiecode.com/js_webgl/md5_converter) by @oosmoxiecode (https://twitter.com/oosmoxiecode).
 */
export class Md5MeshLoader extends Loader {
    private readonly fileLoader: FileLoader;
    private readonly jsonLoader: JsonLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(this.manager);
        this.jsonLoader = new JsonLoader(this.manager);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Md5Mesh> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<string>content));
    }

    private parse(s: string): Md5Mesh {
        return new Md5Mesh(this.parseJoints(s), this.parseMeshes(s));
    }

    private parseJoints(s: string): Md5MeshJoint[] {
        const result: Md5MeshJoint[] = [];
        s.replace(/joints {([^}]*)}/m, (_, joints) => {
            const jointRegExp = /"(\w+)"\s([-\d]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>joints).replace(jointRegExp, (_, name, parent, x, y, z, ox, oy, oz) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const ov = new Vector3(parseFloat(ox), parseFloat(oy), parseFloat(oz));
                const w = -Math.sqrt(Math.abs(1.0 - ov.x * ov.x - ov.y * ov.y - ov.z * ov.z));
                const orientation = new Quaternion(ov.x, ov.y, ov.z, w);
                result.push(new Md5MeshJoint(name, parent, position, orientation));
                return _;
            });
            return _;
        });
        return result;
    }

    private parseMeshes(s: string): Md5Mesh[] {
        const result: Md5Mesh[] = [];
        s.replace(/mesh {([^}]*)}/mg, (_, mesh) => {
            const meshObj = new Md5Mesh();

            (<string>mesh).replace(/shader "(.+)"/, (_, shader) => {
                meshObj.shader = shader;
                return _;
            });

            const verticesRegExp = /vert \d+ \( ([-\d.]+) ([-\d.]+) \) (\d+) (\d+)/g;
            (<string>mesh).replace(verticesRegExp, (_, u, v, weightIndex, weightCount) => {
                const position = new Vector3(0, 0, 0);
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                const uv = new Vector2(parseFloat(u), parseFloat(v));
                const weight = new Md5MeshVertexWeight(parseInt(weightIndex), parseInt(weightCount));
                meshObj.vertices.push(new Md5MeshVertex(position, normal, tangent, uv, weight));
                return _;
            });

            (<string>mesh).replace(/tri \d+ (\d+) (\d+) (\d+)/g, (_, i1, i2, i3) => {
                meshObj.faces.push(parseInt(i1));
                meshObj.faces.push(parseInt(i2));
                meshObj.faces.push(parseInt(i3));
                return _;
            });

            const weightsRegExp = /weight \d+ (\d+) ([-\d.]+) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>mesh).replace(weightsRegExp, (_, joint, bias, x, y, z) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const normal = new Vector3(0, 0, 0);
                const tangent = new Vector3(0, 0, 0);
                meshObj.weights.push(new Md5MeshWeight(parseInt(joint), parseFloat(bias), position, normal, tangent));
                return _;
            });

            result.push(meshObj);
            return _;
        });
        return result;
    }
}
