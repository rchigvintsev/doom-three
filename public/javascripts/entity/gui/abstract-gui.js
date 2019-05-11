import {currentTime} from '../../util/common-utils.js';
import {strings} from '../../strings.js';
import {fonts} from '../../fonts.js';
import {Faces} from '../../util/face-utils.js';

export class AbstractGui extends THREE.Group {
    constructor(parent, materialIndex, materialBuilder) {
        super();

        this._materialBuilder = materialBuilder;

        this._materials = [];
        this._animations = [];

        const guiFaces = [];
        for (let i = 0; i < parent.geometry.faces.length; i++) {
            const face = parent.geometry.faces[i];
            if (face.materialIndex === materialIndex)
                guiFaces.push(face);
        }

        if (guiFaces.length !== 2)
            throw 'Two faces were expected but found ' + guiFaces.length + ' faces instead';

        const face1 = guiFaces[0];
        const face2 = guiFaces[1];

        const commonVertexIndices = Faces.intersection(face1, face2);
        if (commonVertexIndices.length !== 2)
            throw 'Two common vertices were expected but found ' + commonVertexIndices.length + ' vertices instead';

        const v1 = parent.geometry.vertices[commonVertexIndices[0]];
        const v2 = parent.geometry.vertices[commonVertexIndices[1]];
        const v3 = parent.geometry.vertices[Faces.difference(face1, face2)];

        // To compute screen position we should find half of the diagonal distance
        const halfDistance = v1.distanceTo(v2) / 2;
        // then find displacement vector
        const displacement = v1.clone().sub(v2).normalize().multiplyScalar(halfDistance);
        // and finally move one of the diagonal vertices
        this._position = v1.clone().sub(displacement);

        this._normal = face1.normal;
        this._rotation = this._computeRotation(this._position, parent.quaternion, this._normal);

        const distance1 = v3.distanceTo(v1);
        const distance2 = v3.distanceTo(v2);

        const width = Math.max(distance1, distance2);
        const height = Math.min(distance1, distance2);

        this._ratio = new THREE.Vector2(this._getScreenWidth() / width, this._getScreenHeight() / height);
    }

    update(time) {
        for (let material of this._materials)
            material.update(time);
        for (let animation of this._animations)
            animation.update(time);
    }

    _getScreenWidth() {
        throw 'Method "_getScreenWidth" is not implemented';
    }

    _getScreenHeight() {
        throw 'Method "_getScreenHeight" is not implemented';
    }

    _computeRotation(position, quaternion, normal) {
        const direction = new THREE.Vector3();
        direction.addVectors(position, normal);

        const worldUp = new THREE.Vector3();
        worldUp.copy(this.up).applyQuaternion(quaternion);

        const m = new THREE.Matrix4();
        m.lookAt(direction, position, worldUp);

        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(m);

        const rotation = new THREE.Euler();
        rotation.setFromQuaternion(q, undefined, false);
        return rotation;
    }

    _createLayer(materialDef, size, position, yScale) {
        let materialBuilder;
        if (yScale) {
            const $uper = this._materialBuilder;
            materialBuilder = $uper.clone();
            Object.assign(materialBuilder, {
                _createRepetitionProvider(repeat) {
                    const provider = $uper._createRepetitionProvider(repeat);
                    return function (time) {
                        return provider(time) * yScale;
                    };
                }
            });
        } else
            materialBuilder = this._materialBuilder;

        const geometry = new THREE.PlaneGeometry(size.x, size.y);
        let material;
        if (materialDef) {
            material = materialBuilder.build(materialDef.diffuseMap, materialDef);
            material.update(currentTime());
        } else
            material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const layerMesh = new THREE.Mesh(geometry, material);
        layerMesh.position.copy(position);
        layerMesh.rotation.copy(this._rotation);
        return layerMesh;
    }

    _createTextLayer(textCode, font, fontSize, color, opacity, renderOrder, xScale=0.8) {
        const textLayer = new THREE.Group();
        textLayer.renderOrder = renderOrder;
        textLayer.size = new THREE.Vector2();

        const textString = strings[textCode] || textCode;
        let textWidth = 0;
        for (let i = 0; i < textString.length; i++) {
            const charCode = textString.charCodeAt(i);
            const letter = fonts[font][charCode];
            if (!letter)
                console.error('Font "' + font + '" does not support character with code ' + charCode);
            else {
                const letterSize = new THREE.Vector2(letter.size[0] * fontSize * xScale, letter.size[1] * fontSize)
                    .divide(this._ratio);
                const letterPosition = new THREE.Vector3(textWidth + letterSize.x / 2, 0, 0);
                let materialDef = null;
                if (letter.material) {
                    materialDef = Object.assign({}, letter.material);
                    materialDef.opacity = opacity;
                    if (color !== undefined)
                        materialDef.color = color;
                }
                const letterLayer = this._createLayer(materialDef, letterSize, letterPosition);
                letterLayer.material.clipping = true;
                letterLayer.rotation.set(0, 0, 0);
                letterLayer.renderOrder = renderOrder;
                textLayer.add(letterLayer);
                textWidth += letterSize.x
            }
        }

        textLayer.size.x = textWidth;
        return textLayer;
    }
}