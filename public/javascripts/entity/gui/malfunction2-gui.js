import {materials} from '../../map/materials.js';
import {Faces} from '../../util/face-utils.js';
import {currentTime} from '../../util/common-utils.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

export class Malfunction2Gui extends THREE.Group {
    constructor(parentGeometry, materialIndex, materialBuilder) {
        super();

        this._materials = [];
        this._animations = [];
        this._materialBuilder = materialBuilder;

        const guiFaces = [];
        for (let i = 0; i < parentGeometry.faces.length; i++) {
            const face = parentGeometry.faces[i];
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

        const v1 = parentGeometry.vertices[commonVertexIndices[0]];
        const v2 = parentGeometry.vertices[commonVertexIndices[1]];
        const v3 = parentGeometry.vertices[Faces.difference(face1, face2)];

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

        let renderOrder = 0;

        const faceTestMaterials = materials['gui/faces5'];
        for (let material of faceTestMaterials) {
            const layer = this._createWindow(material, new THREE.Vector2(626, 470).divide(ratio), position);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpMaterials = materials['gui/warp/static'];
        for (let material of warpMaterials) {
            const layer = this._createWindow(material, new THREE.Vector2(626, 470).divide(ratio), position);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpLayers = [];
        for (let material of warpMaterials) {
            const layer = this._createWindow(material, new THREE.Vector2(626, 470).divide(ratio), position, 2.0);
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
        const redFadeLayer = this._createWindow(redFadeMaterialDef, new THREE.Vector2(626, 470).divide(ratio),
            position);
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

        const staticMaterials = materials['gui/static'];
        const staticSize = new THREE.Vector2(626, 470).divide(ratio);
        for (let material of staticMaterials) {
            const layer = this._createWindow(material, staticSize, position);
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
        const maskLayer = this._createWindow(maskMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.clone().setY(position.y - 0.01));
        maskLayer.renderOrder = renderOrder;
        this.add(maskLayer);

        renderOrder++;

        const outerGlowMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/outerglow',
            transparent: true,
            opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
        };
        const outerGlowLayer = this._createWindow(outerGlowMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.clone().setY(position.y - 0.01));
        outerGlowLayer.renderOrder = renderOrder;
        this._materials.push(outerGlowLayer.material);
        this.add(outerGlowLayer);

        renderOrder++;

        const outerShadowMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/outershadow',
            transparent: true
        };
        const outerShadowLayer = this._createWindow(outerShadowMaterialDef,
            new THREE.Vector2(640, 480).divide(ratio), position.clone().setY(position.y - 0.01));
        outerShadowLayer.renderOrder = renderOrder;
        this.add(outerShadowLayer);

        renderOrder++;

        const addHighlightLayer = this._createWindow(materials['gui/addhighlight'],
            new THREE.Vector2(640, 480).divide(ratio), position.clone().setY(position.y - 0.01));
        addHighlightLayer.renderOrder = renderOrder;
        this.add(addHighlightLayer);

        renderOrder++;

        const dirtMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/dirt2',
            transparent: true,
            opacity: 0.8
        };
        const dirtLayer = this._createWindow(dirtMaterialDef, new THREE.Vector2(640, 480).divide(ratio),
            position.clone().setY(position.y - 0.01));
        dirtLayer.renderOrder = renderOrder;
        this.add(dirtLayer);
    }

    _createWindow(materialDefinition, size, position, yScale) {
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
        gui.rotation.set(THREE.Math.degToRad(90), THREE.Math.degToRad(180), 0);
        return gui;
    }

    update(time) {
        for (let material of this._materials)
            material.update(time);
        for (let animation of this._animations)
            animation.update(time);
    }
}