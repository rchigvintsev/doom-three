import {AbstractGui} from './abstract-gui.js';
import {MATERIALS} from '../../material/materials.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

const BLACK_BACKGROUND_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/cpuserver/bg',
    color: 0,
    transparent: true
};

export class HealthStationGui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);

        const halfOfScreenWidth = this._getScreenWidth() / 2 / this._ratio.x;
        const halfOfScreenHeight = this._getScreenHeight() / 2 / this._ratio.y;

        const xOrigin = this._position.x - halfOfScreenWidth;
        const yOrigin = this._position.z - halfOfScreenHeight;

        // Prepare position offset to prevent texture flickering
        const positionOffset = this._normal.clone().divideScalar(10.0);
        let renderOrder = 0;

        const bgBlackLayer = this._createLayer(BLACK_BACKGROUND_MATERIAL_DEF,
            new THREE.Vector2(SCREEN_WIDTH + 2, SCREEN_HEIGHT).divide(this._ratio), this._position);
        bgBlackLayer.renderOrder = renderOrder;
        this.add(bgBlackLayer);

        renderOrder++;

        /*const bgBlack1LayerSize = new THREE.Vector2(613, 454).divide(ratio);
        const bgBlack1LayerPosition = this._position.add(positionOffset).clone();
        bgBlack1LayerPosition.x = xOrigin + bgBlack1LayerSize.x / 2 + 9 / ratio.x;
        bgBlack1LayerPosition.z = yOrigin + bgBlack1LayerSize.y / 2 + 9 / ratio.y;
        const bgBlack1Layer = this._createLayer({type: 'shader', color: 0x000000}, bgBlack1LayerSize,
            bgBlack1LayerPosition);
        bgBlack1Layer.renderOrder = renderOrder;
        this.add(bgBlack1Layer);

        renderOrder++;*/

        const hrWinOffset = new THREE.Vector2(17, 85);

        const spike2LayerSize = new THREE.Vector2(135, 36).divide(this._ratio);
        const spike2LayerPosition = this._position.add(positionOffset).clone();
        spike2LayerPosition.x = xOrigin + spike2LayerSize.x / 2 + (hrWinOffset.x + 9) / this._ratio.x;
        spike2LayerPosition.z = yOrigin + spike2LayerSize.y / 2 + (hrWinOffset.y + 186) / this._ratio.y;
        const spike2Materials = MATERIALS['gui/health/ekg2flat'];
        for (let material of spike2Materials) {
            const layer = this._createLayer(material, spike2LayerSize, spike2LayerPosition);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const spike1LayerSize = new THREE.Vector2(135, 28).divide(this._ratio);
        const spike1LayerPosition = this._position.add(positionOffset).clone();
        spike1LayerPosition.x = xOrigin + spike1LayerSize.x / 2 + (hrWinOffset.x + 9) / this._ratio.x;
        spike1LayerPosition.z = yOrigin + spike1LayerSize.y / 2 + (hrWinOffset.y + 118) / this._ratio.y;
        const spike1Materials = MATERIALS['gui/health/ekg3flat'];
        for (let material of spike1Materials) {
            material = Object.assign({}, material);
            material.color = 0xff0000; // TODO: Color should be assigned depending on the player's health level
            const layer = this._createLayer(material, spike1LayerSize, spike1LayerPosition);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        const spikeLayerSize = new THREE.Vector2(134, 80).divide(this._ratio);
        const spikeLayerPosition = this._position.add(positionOffset).clone();
        spikeLayerPosition.x = xOrigin + spikeLayerSize.x / 2 + (hrWinOffset.x + 10) / this._ratio.x;
        spikeLayerPosition.z = yOrigin + spikeLayerSize.y / 2 + (hrWinOffset.y + 8) / this._ratio.y;
        const spikeMaterials = MATERIALS['gui/health/ekgflat'];
        for (let material of spikeMaterials) {
            const layer = this._createLayer(material, spikeLayerSize, spikeLayerPosition);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }
    }

    _getScreenWidth() {
        return SCREEN_WIDTH;
    }

    _getScreenHeight() {
        return SCREEN_HEIGHT;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(-90);
        return rotation;
    }
}