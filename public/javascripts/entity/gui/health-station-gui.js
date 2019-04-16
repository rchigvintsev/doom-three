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

const BORDER_CORNER_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/1pxborder_cornersm',
    transparent: true
};

const VERTICAL_BORDER_MATERIAL_DEF = {
  type: 'shader',
  diffuseMap: 'guis/assets/common/1pxborder_vert',
  transparent: true
};

const HORIZONTAL_BORDER_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/1pxborder_horiz',
    transparent: true
};

const FILL_BOX_CAP_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/scibox/fillboxCap',
    transparent: true
};

const FILL_BOX_CENTER_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/scibox/fillboxCenter',
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
        const positionOffset = this._normal.clone().multiplyScalar(0.01);
        let renderOrder = 0;

        const bgBlackLayer = this._createLayer(BLACK_BACKGROUND_MATERIAL_DEF,
            new THREE.Vector2(SCREEN_WIDTH + 2, SCREEN_HEIGHT).divide(this._ratio), this._position);
        bgBlackLayer.renderOrder = renderOrder;
        this.add(bgBlackLayer);

        renderOrder++;

        const hrWinOffset = new THREE.Vector2(17, 85);

        const spike2LayerSize = new THREE.Vector2(135, 36).divide(this._ratio);
        const spike2LayerPosition = this._position.clone().add(positionOffset);
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
        const spike1LayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(2));
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
        const spikeLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(11));
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

        const btn2Corner2LayerSize = new THREE.Vector2(82, 30).divide(this._ratio);
        const btn2Corner2LayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(14));
        btn2Corner2LayerPosition.x = xOrigin + btn2Corner2LayerSize.x / 2 + (hrWinOffset.x + 74) / this._ratio.x;
        btn2Corner2LayerPosition.z = yOrigin + btn2Corner2LayerSize.y / 2 + (hrWinOffset.y + 5) / this._ratio.y;
        const btn2Corner2Layer = this._createLayer(BORDER_CORNER_MATERIAL_DEF, btn2Corner2LayerSize,
            btn2Corner2LayerPosition);
        btn2Corner2Layer.renderOrder = renderOrder;
        btn2Corner2Layer.rotation.x += THREE.Math.degToRad(180);
        btn2Corner2Layer.rotation.y += THREE.Math.degToRad(180);
        this.add(btn2Corner2Layer);

        renderOrder++;

        const btn2Corner4LayerSize = new THREE.Vector2(82, 30).divide(this._ratio);
        const btn2Corner4LayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(9));
        btn2Corner4LayerPosition.x = xOrigin + btn2Corner4LayerSize.x / 2 + (hrWinOffset.x + 74) / this._ratio.x;
        btn2Corner4LayerPosition.z = yOrigin + btn2Corner4LayerSize.y / 2 + (hrWinOffset.y + 252) / this._ratio.y;
        const btn2Corner4Layer = this._createLayer(BORDER_CORNER_MATERIAL_DEF, btn2Corner4LayerSize,
            btn2Corner4LayerPosition);
        btn2Corner4Layer.renderOrder = renderOrder;
        btn2Corner4Layer.rotation.y += THREE.Math.degToRad(180);
        this.add(btn2Corner4Layer);

        renderOrder++;

        const btn2RightLayerSize = new THREE.Vector2(82, 217).divide(this._ratio);
        const btn2RightLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(2));
        btn2RightLayerPosition.x = xOrigin + btn2RightLayerSize.x / 2 + (hrWinOffset.x + 74) / this._ratio.x;
        btn2RightLayerPosition.z = yOrigin + btn2RightLayerSize.y / 2 + (hrWinOffset.y + 35) / this._ratio.y;
        const btn2RightLayer = this._createLayer(VERTICAL_BORDER_MATERIAL_DEF, btn2RightLayerSize,
            btn2RightLayerPosition);
        btn2RightLayer.renderOrder = renderOrder;
        btn2RightLayer.rotation.x += THREE.Math.degToRad(180);
        btn2RightLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(btn2RightLayer);

        renderOrder++;

        const btn2TopLayerSize = new THREE.Vector2(71, 30).divide(this._ratio);
        const btn2TopLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(14));
        btn2TopLayerPosition.x = xOrigin + btn2TopLayerSize.x / 2 + (hrWinOffset.x + 3) / this._ratio.x;
        btn2TopLayerPosition.z = yOrigin + btn2TopLayerSize.y / 2 + (hrWinOffset.y + 3) / this._ratio.y;
        const btn2TopLayer = this._createLayer(HORIZONTAL_BORDER_MATERIAL_DEF, btn2TopLayerSize, btn2TopLayerPosition);
        btn2TopLayer.renderOrder = renderOrder;
        btn2TopLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(btn2TopLayer);

        renderOrder++;

        const btn2BottomLayerSize = new THREE.Vector2(71, 30).divide(this._ratio);
        const btn2BottomLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(9));
        btn2BottomLayerPosition.x = xOrigin + btn2BottomLayerSize.x / 2 + (hrWinOffset.x + 3) / this._ratio.x;
        btn2BottomLayerPosition.z = yOrigin + btn2BottomLayerSize.y / 2 + (hrWinOffset.y + 254) / this._ratio.y;
        const btn2BottomLayer = this._createLayer(HORIZONTAL_BORDER_MATERIAL_DEF, btn2BottomLayerSize,
            btn2BottomLayerPosition);
        btn2BottomLayer.renderOrder = renderOrder;
        this.add(btn2BottomLayer);

        renderOrder++;

        const fillBoxTopLayerSize = new THREE.Vector2(252, 25).divide(this._ratio);
        const fillBoxTopLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(15));
        fillBoxTopLayerPosition.x = xOrigin + fillBoxTopLayerSize.x / 2 + (hrWinOffset.x - 55) / this._ratio.x;
        fillBoxTopLayerPosition.z = yOrigin + fillBoxTopLayerSize.y / 2 + (hrWinOffset.y + 2) / this._ratio.y;
        const fillBoxTopLayerMaterial = Object.assign({color: 0xff0000, opacity: 0.15}, FILL_BOX_CAP_MATERIAL_DEF);
        const fillBoxTopLayer = this._createLayer(fillBoxTopLayerMaterial, fillBoxTopLayerSize,
            fillBoxTopLayerPosition);
        fillBoxTopLayer.renderOrder = renderOrder;
        this.add(fillBoxTopLayer);

        renderOrder++;

        const fillBoxCenterLayerSize = new THREE.Vector2(252, 234).divide(this._ratio);
        const fillBoxCenterLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(7));
        fillBoxCenterLayerPosition.x = xOrigin + fillBoxCenterLayerSize.x / 2 + (hrWinOffset.x - 54) / this._ratio.x;
        fillBoxCenterLayerPosition.z = yOrigin + fillBoxCenterLayerSize.y / 2 + (hrWinOffset.y + 27) / this._ratio.y;
        const fillBoxCenterLayerMaterial = Object.assign({color: 0xff0000, opacity: 0.15}, FILL_BOX_CENTER_MATERIAL_DEF);
        const fillBoxCenterLayer = this._createLayer(fillBoxCenterLayerMaterial, fillBoxCenterLayerSize,
            fillBoxCenterLayerPosition);
        fillBoxCenterLayer.renderOrder = renderOrder;
        this.add(fillBoxCenterLayer);

        renderOrder++;

        const fillBoxBottomLayerSize = new THREE.Vector2(252, 25).divide(this._ratio);
        const fillBoxBottomLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(9));
        fillBoxBottomLayerPosition.x = xOrigin + fillBoxBottomLayerSize.x / 2 + (hrWinOffset.x - 55) / this._ratio.x;
        fillBoxBottomLayerPosition.z = yOrigin + fillBoxBottomLayerSize.y / 2 + (hrWinOffset.y + 260) / this._ratio.y;
        const fillBoxBottomLayerMaterial = Object.assign({color: 0xff0000, opacity: 0.15}, FILL_BOX_CAP_MATERIAL_DEF);
        const fillBoxBottomLayer = this._createLayer(fillBoxBottomLayerMaterial, fillBoxBottomLayerSize,
            fillBoxBottomLayerPosition);
        fillBoxBottomLayer.rotation.x += THREE.Math.degToRad(180);
        fillBoxBottomLayer.renderOrder = renderOrder;
        this.add(fillBoxBottomLayer);
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