import {currentTime} from '../../util/time.js';
import {STRINGS} from '../../strings.js';
import {FONTS} from '../../fonts.js';
import {ScrollingText} from './scrolling-text.js';
import {Materials, MATERIALS} from '../../material/materials.js';

const Z_OFFSET_STEP = 0.001;

export class AbstractGui extends THREE.Group {
    constructor(parent, materialIndex, materialFactory, guiDef) {
        super();

        this._materialFactory = materialFactory;
        this._materials = [];
        this._animations = [];
        this._updatableLayers = [];

        const screenFaces = this._findScreenFaces(parent, materialIndex);
        if (screenFaces.length !== 2) {
            throw 'Two GUI screen faces were expected but found ' + screenFaces.length + ' faces instead';
        }

        this.position.copy(this._determinePosition(screenFaces, parent.geometry));
        this.rotation.copy(this._determineRotation(this.position, parent.quaternion, screenFaces[0].normal));

        const screenSize = new THREE.Vector2(guiDef.width, guiDef.height);
        this._aspectRatio = this._determineAspectRatio(screenFaces, parent.geometry, screenSize);

        this._initLayers(guiDef);
    }

    update(time) {
        for (let material of this._materials) {
            if (material.update) {
                material.update(time);
            }
        }

        for (let animation of this._animations) {
            animation.update(time);
        }

        for (let updatableLayer of this._updatableLayers) {
            updatableLayer.update(time);
        }
    }

    _findScreenFaces(parent, materialIndex) {
        const screenFaces = [];
        for (let i = 0; i < parent.geometry.faces.length; i++) {
            const face = parent.geometry.faces[i];
            if (face.materialIndex === materialIndex) {
                screenFaces.push(face);
            }
        }
        return screenFaces;
    }

    _findScreenFaceVertices(screenFaces, geometry) {
        const face1 = screenFaces[0];
        const face2 = screenFaces[1];

        const diagonalVertexIndices = [];
        const angularVertexIndices = [];

        const face1VertexIndices = [face1.a, face1.b, face1.c];
        for (let p of ['a', 'b', 'c']) {
            const idx = face1VertexIndices.indexOf(face2[p]);
            if (idx >= 0) {
                diagonalVertexIndices.push(face2[p]);
            } else {
                angularVertexIndices.push(face2[p]);
            }
        }

        if (diagonalVertexIndices.length !== 2) {
            throw 'Two diagonal vertices were expected but found ' + diagonalVertexIndices.length + ' vertices instead';
        }

        return [
            geometry.vertices[diagonalVertexIndices[0]],
            geometry.vertices[diagonalVertexIndices[1]],
            geometry.vertices[angularVertexIndices[0]]
        ];
    }

    _determinePosition(screenFaces, geometry) {
        const vertices = this._findScreenFaceVertices(screenFaces, geometry);

        // To compute screen position we should find half of the diagonal distance
        const halfDistance = vertices[0].distanceTo(vertices[1]) / 2;
        // then find displacement vector
        const displacement = vertices[0].clone().sub(vertices[1]).normalize().multiplyScalar(halfDistance);
        // and finally move one of the diagonal vertices
        return vertices[0].clone().sub(displacement);
    }

    _determineRotation(position, quaternion, normal) {
        const direction = new THREE.Vector3();
        direction.addVectors(position, normal);

        const worldUp = new THREE.Vector3();
        worldUp.copy(this.up).applyQuaternion(quaternion);

        const m = new THREE.Matrix4();
        m.lookAt(direction, position, worldUp);

        const q = new THREE.Quaternion();
        q.setFromRotationMatrix(m);

        const rotation = new THREE.Euler();
        rotation.setFromQuaternion(q, undefined);
        return rotation;
    }

    _determineAspectRatio(screenFaces, geometry, screenSize) {
        const vertices = this._findScreenFaceVertices(screenFaces, geometry);
        const distance1 = vertices[2].distanceTo(vertices[0]);
        const distance2 = vertices[2].distanceTo(vertices[1]);

        // TODO: it may not work for screens with a height exceeding their width
        const width = Math.max(distance1, distance2);
        const height = Math.min(distance1, distance2);
        return new THREE.Vector2(screenSize.x / width, screenSize.y / height);
    }

    _getInitialZOffset() {
        return 0.0;
    }

    _initLayers(guiDef) {
        // Prepare position offset to prevent texture flickering
        let zOffset = this._getInitialZOffset();
        const screenSize = new THREE.Vector2(guiDef.width, guiDef.height);
        let renderOrder = 0;

        for (let layerDef of guiDef.layers) {
            this._initLayer(layerDef, screenSize, zOffset, renderOrder++);
            zOffset += Z_OFFSET_STEP;
        }
    }

    _initLayer(layerDef, screenSize, zOffset, renderOrder) {
        let layerMeshes = [];

        const width = layerDef.size != null ? layerDef.size[0] : screenSize.x;
        const height = layerDef.size != null ? layerDef.size[1] : screenSize.y;
        const size = new THREE.Vector2(width, height).divide(this._aspectRatio);

        const xOffset = layerDef.offset != null ? layerDef.offset[0] : 0;
        const yOffset = layerDef.offset != null ? layerDef.offset[1] : 0;

        const position = new THREE.Vector3()
            .setX(xOffset / this._aspectRatio.x)
            .setY(yOffset * -1 / this._aspectRatio.y)
            .setZ(zOffset);

        if (layerDef.type === 'text' || layerDef.type === 'scrolling-text') {
            layerMeshes = layerMeshes.concat(this._createTextLayerMeshes(layerDef, size, position, renderOrder));
        } else {
            layerMeshes = layerMeshes.concat(this._createRegularLayerMeshes(layerDef, size, position, renderOrder));
        }

        for (let mesh of layerMeshes) {
            if (layerDef.rotation != null) {
                mesh.rotateX(THREE.Math.degToRad(layerDef.rotation[0]));
                mesh.rotateY(THREE.Math.degToRad(layerDef.rotation[1]));
            }
            this.add(mesh);
        }
    }

    _createRegularLayerMeshes(layerDef, layerSize, layerPosition, renderOrder) {
        const layerMeshes = [];

        const materialDefs = this._getLayerMaterialDefs(layerDef);
        for (let materialDef of materialDefs) {
            const material = this._createLayerMaterial(materialDef);
            const mesh = this._createLayerMesh(layerSize, material);
            mesh.position.copy(layerPosition);
            mesh.renderOrder = renderOrder;
            this._materials.push(mesh.material);
            layerMeshes.push(mesh);
        }

        if (layerDef.warp) {
            const warpAnimation = this._createWarpAnimation(layerDef.warp, layerMeshes);
            this._animations.push(warpAnimation);
        }

        return layerMeshes;
    }

    _createTextLayerMeshes(layerDef, layerSize, layerPosition, renderOrder) {
        let mesh;
        if (layerDef.type === 'scrolling-text') {
            mesh = new ScrollingText();
            this._updatableLayers.push(mesh);
        } else {
            mesh = new THREE.Mesh();
        }

        const scale = layerDef.scale != null ? layerDef.scale : [0.8, 1.0];
        const textString = STRINGS[layerDef.text] || layerDef.text;
        const textSize = new THREE.Vector2();

        const letterMeshes = this._createLetterLayerMeshes(layerDef, textString, textSize, scale);
        for (let letterMesh of letterMeshes) {
            letterMesh.renderOrder = renderOrder;
            mesh.add(letterMesh);
        }

        if (layerDef.textAlign === 'center') {
            layerPosition.setX(layerPosition.x - textSize.x / 2)
        } else if (layerDef.textAlign === 'right') {
            layerPosition.setX(layerPosition.x + layerSize.x / 2 - textSize.x);
        }
        mesh.position.copy(layerPosition)

        if (layerDef.type === 'scrolling-text') {
            const boundaries = new THREE.Vector2(
                this.position.x + layerDef.boundaries[0] / this._aspectRatio.x,
                this.position.x + layerDef.boundaries[1] / this._aspectRatio.x
            );
            mesh.init(textSize, boundaries, layerSize.x, 22000, 2000);
        }

        return [mesh];
    }

    _createLetterLayerMeshes(layerDef, text, textSize, scale) {
        const letterMeshes = [];
        const lines = [];
        const textOffset = new THREE.Vector2();
        let lineNumber = 0;

        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode === 10) {
                textOffset.x = 0;
                textOffset.y -= 1.5 * layerDef.fontSize / this._aspectRatio.y;
                lineNumber++;
            } else {
                const letterDef = FONTS[layerDef.font][charCode];
                if (!letterDef) {
                    console.error('Font "' + layerDef.font + '" does not support character with code ' + charCode);
                } else {
                    const letterSize = new THREE.Vector2(
                        letterDef.size[0] * layerDef.fontSize * scale[0],
                        letterDef.size[1] * layerDef.fontSize * scale[1]
                    ).divide(this._aspectRatio);

                    const letterMaterialDef = letterDef.material
                        ? Materials.override(letterDef.material, layerDef)
                        : {type: 'basic', transparent: true, opacity: 0};
                    const letterMaterial = this._createLayerMaterial(letterMaterialDef);
                    letterMaterial.clipping = true;
                    this._materials.push(letterMaterial);

                    const letterMesh = this._createLayerMesh(letterSize, letterMaterial);
                    letterMeshes.push(letterMesh);

                    const letterPosition = new THREE.Vector3(textOffset.x + letterSize.x / 2, textOffset.y, 0);
                    letterMesh.position.copy(letterPosition);

                    textOffset.x += letterSize.x;
                    if (textOffset.x > textSize.x) {
                        textSize.x = textOffset.x;
                    }
                    if (textOffset.y > textSize.y) {
                        textSize.y = textOffset.y;
                    }

                    if (lines.length === lineNumber) {
                        lines.push({width: 0, letters: []});
                    }
                    lines[lineNumber].letters.push(letterMesh);
                    lines[lineNumber].width = textOffset.x;
                }
            }
        }
        this._alignLettersToCenter(lines, textSize);

        return letterMeshes;
    }

    _alignLettersToCenter(lines, textSize) {
        for (let line of lines) {
            if (line.width < textSize.x) {
                const xOffset = (textSize.x - line.width) / 2;
                for (let letter of line.letters) {
                    letter.position.x += xOffset;
                }
            }
        }
    }

    _getLayerMaterialDefs(layerDef) {
        let materialDefs;
        if (layerDef.material) {
            materialDefs = MATERIALS[layerDef.material];
        }

        if (!materialDefs) {
            materialDefs = [{type: 'shader'}];
        } else {
            materialDefs = Array.isArray(materialDefs) ? materialDefs : [materialDefs];
        }

        for (let i = 0; i < materialDefs.length; i++) {
            materialDefs[i] = Materials.override(materialDefs[i], layerDef);
        }

        return materialDefs;
    }

    _createLayerMaterial(materialDef) {
        let material;
        if (materialDef) {
            material = this._materialFactory.build(materialDef.diffuseMap, materialDef);
            material.update(currentTime());
        } else {
            material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        }
        return material;
    }

    _createLayerMesh(size, material) {
        const geometry = new THREE.PlaneGeometry(size.x, size.y);
        return new THREE.Mesh(geometry, material);
    }

    // TODO: create warp animation in material factory
    _createWarpAnimation(warpDef, targetMeshes) {
        let onUpdate;
        if (warpDef.target === 'visibility') {
            onUpdate = (params) => {
                const visible = params.opacity >= 0;
                for (let mesh of targetMeshes) {
                    mesh.visible = visible;
                }
            };
        } else {
            onUpdate = (params) => {
                for (let mesh of targetMeshes) {
                    mesh.material.uniforms['opacity'].value = params.opacity;
                }
            };
        }

        const warpTween = new TWEEN.Tween({opacity: warpDef.values[0]})
            .to({opacity: warpDef.values[1]}, warpDef.duration)
            .yoyo(true)
            .repeat(Infinity)
            .onUpdate(onUpdate);
        warpTween.start();
        return warpTween;
    }
}
