import {BufferGeometry, Vector3} from 'three';

export class BufferGeometries {
    static applyTubeDeform(geometry: BufferGeometry, view: Vector3, face1: Vector3, face2: Vector3) {
        const positions = geometry.getAttribute('position');

        const v1 = new Vector3(positions.getX(face1.x), positions.getY(face1.x), positions.getZ(face1.x));
        const v2 = new Vector3(positions.getX(face1.y), positions.getY(face1.y), positions.getZ(face1.y));
        const v3 = new Vector3(positions.getX(face1.z), positions.getY(face1.z), positions.getZ(face1.z));
        const v4 = new Vector3(positions.getX(face2.x), positions.getY(face2.x), positions.getZ(face2.x));

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

        positions.setXYZ(face1.x, v1.x, v1.y, v1.z);
        positions.setXYZ(face1.y, v2.x, v2.y, v2.z);
        positions.setXYZ(face1.z, v3.x, v3.y, v3.z);
        positions.setXYZ(face2.x, v4.x, v4.y, v4.z);

        // Additionally change vertices with the same positions as v1 and v2
        positions.setXYZ(face2.y, v1.x, v1.y, v1.z);
        positions.setXYZ(face2.z, v2.x, v2.y, v2.z);

        positions.needsUpdate = true;
    }
}