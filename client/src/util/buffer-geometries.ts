import {BufferGeometry, Vector3} from 'three';
import {Face3} from '../geometry/face3';

export class BufferGeometries {
    static applyTubeDeform(geometry: BufferGeometry, view: Vector3, face1: Face3, face2: Face3) {
        const positions = geometry.getAttribute('position');

        const v1 = new Vector3(positions.getX(face1.a), positions.getY(face1.a), positions.getZ(face1.a));
        const v2 = new Vector3(positions.getX(face1.b), positions.getY(face1.b), positions.getZ(face1.b));
        const v3 = new Vector3(positions.getX(face1.c), positions.getY(face1.c), positions.getZ(face1.c));
        const v4 = new Vector3(positions.getX(face2.a), positions.getY(face2.a), positions.getZ(face2.a));

        // v1 - v3 and v2 - v4 have the shortest distances

        const v1v3Len = v3.clone().sub(v1).length();
        const v2v4Len = v4.clone().sub(v2).length();

        const v1v3Mid = new Vector3(
            0.5 * (v1.x + v3.x),
            0.5 * (v1.y + v3.y),
            0.5 * (v1.z + v3.z)
        );

        const v2v4Mid = new Vector3(
            0.5 * (v2.x + v4.x),
            0.5 * (v2.y + v4.y),
            0.5 * (v2.z + v4.z)
        );

        const major = new Vector3().subVectors(v1v3Mid, v2v4Mid);
        const minor = new Vector3();

        let dir = v1v3Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v1v3Len);
        v1.copy(v1v3Mid.clone().sub(minor));
        v3.copy(v1v3Mid.clone().add(minor));

        dir = v2v4Mid.clone().sub(view);
        minor.crossVectors(major, dir).normalize();

        minor.multiplyScalar(0.5 * v2v4Len);
        v2.copy(v2v4Mid.clone().add(minor));
        v4.copy(v2v4Mid.clone().sub(minor));

        positions.setXYZ(face1.a, v1.x, v1.y, v1.z);
        positions.setXYZ(face1.b, v2.x, v2.y, v2.z);
        positions.setXYZ(face1.c, v3.x, v3.y, v3.z);
        positions.setXYZ(face2.a, v4.x, v4.y, v4.z);

        // Additionally change vertices with the same positions as v3 and v4
        positions.setXYZ(face2.b, v3.x, v3.y, v3.z);
        positions.setXYZ(face2.c, v4.x, v4.y, v4.z);

        positions.needsUpdate = true;
    }
}