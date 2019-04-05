import {MATERIALS} from '../../material/materials.js';
import {Faces} from '../../util/face-utils.js';
import {currentTime} from '../../util/common-utils.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

export class Malfunction2Gui extends THREE.Group {
    constructor(parent, materialIndex, materialBuilder) {
        super();

        this._materials = [];
        this._animations = [];
        this._materialBuilder = materialBuilder;

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

        const distance1 = v3.distanceTo(v1);
        const distance2 = v3.distanceTo(v2);

        const width = Math.max(distance1, distance2);
        const height = Math.min(distance1, distance2);

        const ratio = new THREE.Vector2(SCREEN_WIDTH / width, SCREEN_HEIGHT / height);

        // To compute screen position we should find half of the diagonal distance
        const halfDistance = v1.distanceTo(v2) / 2;
        // then find displacement vector
        const displacement = v1.clone().sub(v2).normalize().multiplyScalar(halfDistance);
        // and finally move one of the diagonal vertices
        const position = v1.clone().sub(displacement);
        // Prepare position offset to prevent texture flickering
        const positionOffset = face1.normal.clone().multiplyScalar(0.01);

        const rotation = this._computeRotation(position, parent.quaternion, face1.normal);

        let renderOrder = 0;

        const faceTestMaterials = MATERIALS['gui/faces5'];
        for (let material of faceTestMaterials) {
            const layer = this._createLayer(material, new THREE.Vector2(626, 470).divide(ratio), position, rotation);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpMaterials = MATERIALS['gui/warp/static'];
        for (let material of warpMaterials) {
            const layer = this._createLayer(material, new THREE.Vector2(626, 470).divide(ratio), position, rotation);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpLayers = [];
        for (let material of warpMaterials) {
            const layer = this._createLayer(material,
                new THREE.Vector2(626, 470).divide(ratio), position, rotation, 2.0);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            warpLayers.push(layer);
            renderOrder++;
        }
        const warpTween = new TWEEN.Tween({opacity: 1})
            .to({opacity: -1}, 100)
            .yoyo(true)
            .repeat(Infinity)
            .onUpdate(function (params) {
                const visible = params.opacity >= 0;
                for (let layer of warpLayers)
                    layer.visible = visible;
            });
        this._animations.push(warpTween);
        warpTween.start();

        const redFadeMaterialDef = {type: 'shader', color: 0x660000, transparent: true, opacity: 0.0};
        const redFadeLayer = this._createLayer(redFadeMaterialDef, new THREE.Vector2(626, 470).divide(ratio),
            position, rotation);
        redFadeLayer.renderOrder = renderOrder;
        this.add(redFadeLayer);
        const redFadeTween = new TWEEN.Tween({opacity: 0.0})
            .to({opacity: 0.3}, 1000)
            .yoyo(true)
            .repeat(Infinity)
            .onUpdate(function (params) {
                redFadeLayer.material.uniforms['opacity'].value = params.opacity;
            });
        this._animations.push(redFadeTween);
        redFadeTween.start();

        renderOrder++;

        const staticMaterials = MATERIALS['gui/static'];
        const staticSize = new THREE.Vector2(626, 470).divide(ratio);
        for (let material of staticMaterials) {
            const layer = this._createLayer(material, staticSize, position, rotation);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const maskMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/test/mask',
            transparent: true,
            opacity: 0.2
        };
        const maskLayer = this._createLayer(maskMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.add(positionOffset), rotation);
        maskLayer.renderOrder = renderOrder;
        this.add(maskLayer);

        renderOrder++;

        const outerGlowMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/outerglow',
            transparent: true,
            opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
        };
        const outerGlowLayer = this._createLayer(outerGlowMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.add(positionOffset), rotation);
        outerGlowLayer.renderOrder = renderOrder;
        this._materials.push(outerGlowLayer.material);
        this.add(outerGlowLayer);

        renderOrder++;

        const outerShadowMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/outershadow',
            transparent: true
        };
        const outerShadowLayer = this._createLayer(outerShadowMaterialDef,
            new THREE.Vector2(640, 480).divide(ratio), position.add(positionOffset), rotation);
        outerShadowLayer.renderOrder = renderOrder;
        this.add(outerShadowLayer);

        renderOrder++;

        const addHighlightLayer = this._createLayer(MATERIALS['gui/addhighlight'],
            new THREE.Vector2(640, 480).divide(ratio), position.add(positionOffset), rotation);
        addHighlightLayer.renderOrder = renderOrder;
        this.add(addHighlightLayer);

        renderOrder++;

        const dirtMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/dirt2',
            transparent: true,
            opacity: 0.8
        };
        const dirtLayer = this._createLayer(dirtMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.add(positionOffset), rotation);
        dirtLayer.renderOrder = renderOrder;
        this.add(dirtLayer);
    }

    update(time) {
        for (let material of this._materials)
            material.update(time);
        for (let animation of this._animations)
            animation.update(time);
    }

    _createLayer(materialDefinition, size, position, rotation, yScale) {
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
        const material = materialBuilder.build(materialDefinition.diffuseMap, materialDefinition);
        material.update(currentTime());
        const gui = new THREE.Mesh(geometry, material);
        gui.position.copy(position);
        gui.rotation.copy(rotation);
        return gui;
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
        rotation.x += THREE.Math.degToRad(-180);
        return rotation;
    }
}