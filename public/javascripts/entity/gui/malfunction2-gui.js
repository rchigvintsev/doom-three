import {MATERIALS} from '../../material/materials.js';
import {AbstractGui} from './abstract-gui.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

export class Malfunction2Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);

        // Prepare position offset to prevent texture flickering
        const positionOffset = this._normal.clone().multiplyScalar(0.01);
        let renderOrder = 0;

        const faceTestMaterials = MATERIALS['gui/faces5'];
        for (let material of faceTestMaterials) {
            const layer = this._createLayer(material, new THREE.Vector2(626, 470).divide(this._ratio), this._position);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpMaterials = MATERIALS['gui/warp/static'];
        for (let material of warpMaterials) {
            const layer = this._createLayer(material, new THREE.Vector2(626, 470).divide(this._ratio), this._position);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const warpLayers = [];
        for (let material of warpMaterials) {
            const layer = this._createLayer(material, new THREE.Vector2(626, 470).divide(this._ratio), this._position,
                2.0);
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
        const redFadeLayer = this._createLayer(redFadeMaterialDef, new THREE.Vector2(626, 470).divide(this._ratio),
            this._position);
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
        const staticSize = new THREE.Vector2(626, 470).divide(this._ratio);
        for (let material of staticMaterials) {
            const layer = this._createLayer(material, staticSize, this._position);
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
        const maskLayer = this._createLayer(maskMaterialDef, new THREE.Vector2(640, 480).divide(this._ratio),
            this._position.add(positionOffset));
        maskLayer.renderOrder = renderOrder;
        this.add(maskLayer);

        renderOrder++;

        const outerGlowMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/outerglow',
            transparent: true,
            opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
        };
        const outerGlowLayer = this._createLayer(outerGlowMaterialDef, new THREE.Vector2(640, 480).divide(this._ratio),
            this._position.add(positionOffset));
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
            new THREE.Vector2(640, 480).divide(this._ratio), this._position.add(positionOffset));
        outerShadowLayer.renderOrder = renderOrder;
        this.add(outerShadowLayer);

        renderOrder++;

        const addHighlightLayer = this._createLayer(MATERIALS['gui/addhighlight'],
            new THREE.Vector2(640, 480).divide(this._ratio), this._position.add(positionOffset));
        addHighlightLayer.renderOrder = renderOrder;
        this.add(addHighlightLayer);

        renderOrder++;

        const dirtMaterialDef = {
            type: 'shader',
            diffuseMap: 'guis/assets/common/dirt2',
            transparent: true,
            opacity: 0.8
        };
        const dirtLayer = this._createLayer(dirtMaterialDef, new THREE.Vector2(640, 480).divide(this._ratio),
            this._position.add(positionOffset));
        dirtLayer.renderOrder = renderOrder;
        this.add(dirtLayer);
    }


    _getScreenWidth() {
        return SCREEN_WIDTH;
    }


    _getScreenHeight() {
        return SCREEN_HEIGHT;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.x += THREE.Math.degToRad(-180);
        return rotation;
    }
}