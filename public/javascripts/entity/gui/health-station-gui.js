import {AbstractGui} from './abstract-gui.js';
import {MATERIALS} from '../../material/materials.js';
import {ScrollingText} from './scrolling-text.js';

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

const CRANE_BOX_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/caverns/cranebox',
    transparent: true,
    color: 0x000000,
    clamp: true,
    translate: [0.34, 0]
};

const RED_CRANE_BOX_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/caverns/cranebox',
    transparent: true,
    opacity: 0.1,
    color: 0xff0000,
    clamp: true,
    translate: [0.34, 0]
};

const RED_CIRCLE1_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/health/circle',
    transparent: true,
    opacity: 0.42,
    color: 0xff0000
};

const RED_CIRCLE2_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/health/circle',
    transparent: true,
    opacity: 0.62,
    color: 0xff0000
};

const BLACK_CIRCLE_CLIP_MATERIAL_DEF = {
    type: 'shader',
    color: 0x000000,
    transparent: true
};

const HEALTH_LINE_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/health/line',
    transparent: true,
    opacity: 0.4,
    color: 0xff0000
};

const GLOW_BORDER_VERT_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/glowborder_vert',
    transparent: true,
    color: 0xb3e6ff
};

const GLOW_BORDER_HORIZ_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/glowborder_horiz',
    transparent: true,
    color: 0xb3e6ff
};

const GLOW_BORDER_CORNER4_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/glowborder_corner4',
    transparent: true,
    color: 0xb3e6ff
};

const GLOW_BORDER_CORNER3_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/glowborder_corner3',
    transparent: true,
    color: 0xb3e6ff
};

const IN_BG_FILL_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/airlock/inbgfill',
    transparent: true,
    opacity: 0.2,
    color: 0x71b4ff
};

const OUTER_SHADOW_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/outershadow',
    transparent: true,
    color: 0xffffff
};

const BUTTON2_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/health/button2',
    transparent: true,
    opacity: 0.5,
    color: 0xcccccc
};

const BUTTON2_BAR_MATERIAL_DEF = {
    type: 'shader',
    diffuseMap: 'guis/assets/health/button2bar',
    transparent: true,
    opacity: 0.2,
    color: 0xffffff
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

        const fillBoxBottomLayerSize = new THREE.Vector2(252, 28).divide(this._ratio);
        const fillBoxBottomLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(9));
        fillBoxBottomLayerPosition.x = xOrigin + fillBoxBottomLayerSize.x / 2 + (hrWinOffset.x - 55) / this._ratio.x;
        fillBoxBottomLayerPosition.z = yOrigin + fillBoxBottomLayerSize.y / 2 + (hrWinOffset.y + 260) / this._ratio.y;
        const fillBoxBottomLayerMaterial = Object.assign({color: 0xff0000, opacity: 0.15}, FILL_BOX_CAP_MATERIAL_DEF);
        const fillBoxBottomLayer = this._createLayer(fillBoxBottomLayerMaterial, fillBoxBottomLayerSize,
            fillBoxBottomLayerPosition);
        fillBoxBottomLayer.rotation.x += THREE.Math.degToRad(180);
        fillBoxBottomLayer.renderOrder = renderOrder;
        this.add(fillBoxBottomLayer);

        renderOrder++;

        const textHr1LayerSize = new THREE.Vector2(133, 40).divide(this._ratio);
        const textHr1LayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(12));
        textHr1LayerPosition.x = xOrigin + textHr1LayerSize.x / 2 + (hrWinOffset.x + 6) / this._ratio.x;
        textHr1LayerPosition.z = yOrigin + textHr1LayerSize.y / 2 + (hrWinOffset.y + 73) / this._ratio.y;
        const textHr1Layer = this._createTextLayer('0', 'micro', 25, undefined, 0.7, renderOrder, 0.7);
        textHr1LayerPosition.x += textHr1LayerSize.x / 2 - textHr1Layer.size.x;
        textHr1Layer.position.copy(textHr1LayerPosition);
        textHr1Layer.rotation.copy(this._rotation);
        this.add(textHr1Layer);

        renderOrder++;

        const textHr2LayerSize = new THREE.Vector2(133, 40).divide(this._ratio);
        const textHr2LayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(6));
        textHr2LayerPosition.x = xOrigin + textHr2LayerSize.x / 2 + (hrWinOffset.x + 4) / this._ratio.x;
        textHr2LayerPosition.z = yOrigin + textHr2LayerSize.y / 2 + (hrWinOffset.y + 139) / this._ratio.y;
        const textHr2Layer = this._createTextLayer('0 / 0', 'micro', 18, undefined, 0.5, renderOrder, 0.7);
        textHr2LayerPosition.x += textHr2LayerSize.x / 2 - textHr2Layer.size.x;
        textHr2Layer.position.copy(textHr2LayerPosition);
        textHr2Layer.rotation.copy(this._rotation);
        this.add(textHr2Layer);

        renderOrder++;

        const textHr3LayerSize = new THREE.Vector2(133, 59).divide(this._ratio);
        const textHr3LayerPosition = this._position.clone();
        textHr3LayerPosition.x = xOrigin + textHr3LayerSize.x / 2 + (hrWinOffset.x + 4) / this._ratio.x;
        textHr3LayerPosition.z = yOrigin + textHr3LayerSize.y / 2 + (hrWinOffset.y + 200) / this._ratio.y;
        const textHr3Layer = this._createTextLayer('0 / 0', 'micro', 18, undefined, 0.5, renderOrder, 0.7);
        textHr3LayerPosition.x += textHr3LayerSize.x / 2 - textHr3Layer.size.x;
        textHr3Layer.position.copy(textHr3LayerPosition);
        textHr3Layer.rotation.copy(this._rotation);
        this.add(textHr3Layer);

        renderOrder++;

        const textHr4LayerSize = new THREE.Vector2(133, 59).divide(this._ratio);
        const textHr4LayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(2));
        textHr4LayerPosition.x = xOrigin + textHr4LayerSize.x / 2 + (hrWinOffset.x + 4) / this._ratio.x;
        textHr4LayerPosition.z = yOrigin + textHr4LayerSize.y / 2 + (hrWinOffset.y + 220) / this._ratio.y;
        const textHr4Layer = this._createTextLayer('0', 'micro', 18, undefined, 0.5, renderOrder, 0.7);
        textHr4LayerPosition.x += textHr4LayerSize.x / 2 - textHr4Layer.size.x;
        textHr4Layer.position.copy(textHr4LayerPosition);
        textHr4Layer.rotation.copy(this._rotation);
        this.add(textHr4Layer);

        renderOrder++;

        const textScrollLayerSize = new THREE.Vector2(317, 32).divide(this._ratio);
        const textScrollLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(14));
        textScrollLayerPosition.x = xOrigin + textScrollLayerSize.x + 299 / this._ratio.x;
        textScrollLayerPosition.z = yOrigin + textScrollLayerSize.y / 2 + 394 / this._ratio.y;
        const textScrollLayer = this._createTextLayer('#str_00770', 'micro', 18, 0xb2e5ff, 0.5, renderOrder);
        textScrollLayer.position.copy(textScrollLayerPosition);
        textScrollLayer.rotation.copy(this._rotation);
        this.add(textScrollLayer);

        const boundaries = new THREE.Vector2(xOrigin + 2.83, xOrigin + 16.91);
        this._scrollingText = new ScrollingText(textScrollLayer, boundaries, textScrollLayerSize.x, 22000, 2000);

        renderOrder++;

        const circClipOffset = new THREE.Vector2(19, 19);

        const circFrameBtmBlackLayerSize = new THREE.Vector2(489, 208).divide(this._ratio);
        const circFrameBtmBlackLayerPosition = this._position.clone();
        circFrameBtmBlackLayerPosition.x = xOrigin + circFrameBtmBlackLayerSize.x / 2
            + circClipOffset.x / this._ratio.x;
        circFrameBtmBlackLayerPosition.z = yOrigin + circFrameBtmBlackLayerSize.y / 2
            + (circClipOffset.y + 204) / this._ratio.y;
        const circFrameBtmBlackLayer = this._createLayer(CRANE_BOX_MATERIAL_DEF, circFrameBtmBlackLayerSize,
            circFrameBtmBlackLayerPosition);
        circFrameBtmBlackLayer.renderOrder = renderOrder;
        circFrameBtmBlackLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(circFrameBtmBlackLayer);

        renderOrder++;

        const circle1RedLayerSize = new THREE.Vector2(590, 440).divide(this._ratio);
        const circle1RedLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(9));
        circle1RedLayerPosition.x = xOrigin + circle1RedLayerSize.x / 2 + (circClipOffset.x + 88) / this._ratio.x;
        circle1RedLayerPosition.z = yOrigin + circle1RedLayerSize.y / 2 + (circClipOffset.y - 10) / this._ratio.y;
        const circle1RedLayer = this._createLayer(RED_CIRCLE1_MATERIAL_DEF, circle1RedLayerSize, circle1RedLayerPosition);
        circle1RedLayer.renderOrder = renderOrder;
        this.add(circle1RedLayer);

        renderOrder++;

        const circle2RedLayerSize = new THREE.Vector2(538, 401).divide(this._ratio);
        const circle2RedLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(10));
        circle2RedLayerPosition.x = xOrigin + circle2RedLayerSize.x / 2 + (circClipOffset.x + 114) / this._ratio.x;
        circle2RedLayerPosition.z = yOrigin + circle2RedLayerSize.y / 2 + (circClipOffset.y + 8) / this._ratio.y;
        const circle2RedLayer = this._createLayer(RED_CIRCLE2_MATERIAL_DEF, circle2RedLayerSize, circle2RedLayerPosition);
        circle2RedLayer.renderOrder = renderOrder;
        this.add(circle2RedLayer);

        renderOrder++;

        const blackCircleClipLayerSize = new THREE.Vector2(221, 346).divide(this._ratio);
        const blackCircleClipLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(11));
        blackCircleClipLayerPosition.x = xOrigin + blackCircleClipLayerSize.x / 2
            + (circClipOffset.x + 385) / this._ratio.x;
        blackCircleClipLayerPosition.z = yOrigin + blackCircleClipLayerSize.y / 2
            + (circClipOffset.y + 35) / this._ratio.y;
        const blackCircleClipLayer = this._createLayer(BLACK_CIRCLE_CLIP_MATERIAL_DEF, blackCircleClipLayerSize,
            blackCircleClipLayerPosition);
        blackCircleClipLayer.renderOrder = renderOrder;
        this.add(blackCircleClipLayer);

        renderOrder++;

        const bar1TopRedLayerSize = new THREE.Vector2(214, 30).divide(this._ratio);
        const bar1TopRedLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(25));
        bar1TopRedLayerPosition.x = xOrigin + bar1TopRedLayerSize.x / 2 + (circClipOffset.x + 385) / this._ratio.x;
        bar1TopRedLayerPosition.z = yOrigin + bar1TopRedLayerSize.y / 2 + (circClipOffset.y + 36) / this._ratio.y;
        const bar1TopRedLayer = this._createLayer(HEALTH_LINE_MATERIAL_DEF, bar1TopRedLayerSize,
            bar1TopRedLayerPosition);
        bar1TopRedLayer.renderOrder = renderOrder;
        this.add(bar1TopRedLayer);

        renderOrder++;

        const bar1BtmRedLayerSize = new THREE.Vector2(214, 30).divide(this._ratio);
        const bar1BtmRedLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(2));
        bar1BtmRedLayerPosition.x = xOrigin + bar1BtmRedLayerSize.x / 2 + (circClipOffset.x + 385) / this._ratio.x;
        bar1BtmRedLayerPosition.z = yOrigin + bar1BtmRedLayerSize.y / 2 + (circClipOffset.y + 354) / this._ratio.y;
        const bar1BtmRedLayer = this._createLayer(HEALTH_LINE_MATERIAL_DEF, bar1BtmRedLayerSize,
            bar1BtmRedLayerPosition);
        bar1BtmRedLayer.renderOrder = renderOrder;
        bar1BtmRedLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(bar1BtmRedLayer);

        renderOrder++;

        const bar2TopRedLayerSize = new THREE.Vector2(214, 27).divide(this._ratio);
        const bar2TopRedLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(24));
        bar2TopRedLayerPosition.x = xOrigin + bar2TopRedLayerSize.x / 2 + (circClipOffset.x + 385) / this._ratio.x;
        bar2TopRedLayerPosition.z = yOrigin + bar2TopRedLayerSize.y / 2 + (circClipOffset.y + 51) / this._ratio.y;
        const bar2TopLayerMaterialDef = Object.assign({}, HEALTH_LINE_MATERIAL_DEF);
        bar2TopLayerMaterialDef.opacity = 0.6;
        const bar2TopRedLayer = this._createLayer(bar2TopLayerMaterialDef, bar2TopRedLayerSize,
            bar2TopRedLayerPosition);
        bar2TopRedLayer.renderOrder = renderOrder;
        this.add(bar2TopRedLayer);

        renderOrder++;

        const bar2BtmRedLayerSize = new THREE.Vector2(214, 27).divide(this._ratio);
        const bar2BtmRedLayerPosition = this._position.clone();
        bar2BtmRedLayerPosition.x = xOrigin + bar2BtmRedLayerSize.x / 2 + (circClipOffset.x + 385) / this._ratio.x;
        bar2BtmRedLayerPosition.z = yOrigin + bar2BtmRedLayerSize.y / 2 + (circClipOffset.y + 341) / this._ratio.y;
        const bar2BtmLayerMaterialDef = Object.assign({}, HEALTH_LINE_MATERIAL_DEF);
        bar2BtmLayerMaterialDef.opacity = 0.6;
        const bar2BtmRedLayer = this._createLayer(bar2BtmLayerMaterialDef, bar2BtmRedLayerSize,
            bar2BtmRedLayerPosition);
        bar2BtmRedLayer.renderOrder = renderOrder;
        bar2BtmRedLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(bar2BtmRedLayer);

        renderOrder++;

        const circFrameBtmLayerSize = new THREE.Vector2(489, 191).divide(this._ratio);
        const circFrameBtmLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(2));
        circFrameBtmLayerPosition.x = xOrigin + circFrameBtmLayerSize.x / 2 + circClipOffset.x / this._ratio.x;
        circFrameBtmLayerPosition.z = yOrigin + circFrameBtmLayerSize.y / 2 + (circClipOffset.y + 218) / this._ratio.y;
        const circFrameBtmLayer = this._createLayer(RED_CRANE_BOX_MATERIAL_DEF, circFrameBtmLayerSize,
            circFrameBtmLayerPosition);
        circFrameBtmLayer.renderOrder = renderOrder;
        circFrameBtmLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(circFrameBtmLayer);

        renderOrder++;

        const circFrameTopLayerSize = new THREE.Vector2(489, 191).divide(this._ratio);
        const circFrameTopLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(19));
        circFrameTopLayerPosition.x = xOrigin + circFrameTopLayerSize.x / 2 + circClipOffset.x / this._ratio.x;
        circFrameTopLayerPosition.z = yOrigin + circFrameTopLayerSize.y / 2 + (circClipOffset.y + 12) / this._ratio.y;
        const circFrameTopLayer = this._createLayer(RED_CRANE_BOX_MATERIAL_DEF, circFrameTopLayerSize,
            circFrameTopLayerPosition);
        circFrameTopLayer.renderOrder = renderOrder;
        this.add(circFrameTopLayer);

        renderOrder++;

        const rightBorderLayerSize = new THREE.Vector2(59, 352).divide(this._ratio);
        const rightBorderLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(10));
        rightBorderLayerPosition.x = xOrigin + rightBorderLayerSize.x / 2 + 576 / this._ratio.x;
        rightBorderLayerPosition.z = yOrigin + rightBorderLayerSize.y / 2 + 64 / this._ratio.y;
        const rightBorderLayer = this._createLayer(GLOW_BORDER_VERT_MATERIAL_DEF, rightBorderLayerSize,
            rightBorderLayerPosition);
        rightBorderLayer.renderOrder = renderOrder;
        rightBorderLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(rightBorderLayer);

        renderOrder++;

        const leftBorderLayerSize = new THREE.Vector2(59, 352).divide(this._ratio);
        const leftBorderLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(10));
        leftBorderLayerPosition.x = xOrigin + leftBorderLayerSize.x / 2 + 5 / this._ratio.x;
        leftBorderLayerPosition.z = yOrigin + leftBorderLayerSize.y / 2 + 64 / this._ratio.y;
        const leftBorderLayer = this._createLayer(GLOW_BORDER_VERT_MATERIAL_DEF, leftBorderLayerSize,
            leftBorderLayerPosition);
        leftBorderLayer.renderOrder = renderOrder;
        this.add(leftBorderLayer);

        renderOrder++;

        const topBorderLayerSize = new THREE.Vector2(512, 59).divide(this._ratio);
        const topBorderLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(28));
        topBorderLayerPosition.x = xOrigin + topBorderLayerSize.x / 2 + 64 / this._ratio.x;
        topBorderLayerPosition.z = yOrigin + topBorderLayerSize.y / 2 + 5 / this._ratio.y;
        const topBorderLayer = this._createLayer(GLOW_BORDER_HORIZ_MATERIAL_DEF, topBorderLayerSize,
            topBorderLayerPosition);
        topBorderLayer.renderOrder = renderOrder;
        topBorderLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(topBorderLayer);

        renderOrder++;

        const bottomBorderLayerSize = new THREE.Vector2(512, 59).divide(this._ratio);
        const bottomBorderLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(7));
        bottomBorderLayerPosition.x = xOrigin + bottomBorderLayerSize.x / 2 + 64 / this._ratio.x;
        bottomBorderLayerPosition.z = yOrigin + bottomBorderLayerSize.y / 2 + 416 / this._ratio.y;
        const bottomBorderLayer = this._createLayer(GLOW_BORDER_HORIZ_MATERIAL_DEF, bottomBorderLayerSize,
            bottomBorderLayerPosition);
        bottomBorderLayer.renderOrder = renderOrder;
        this.add(bottomBorderLayer);

        renderOrder++;

        const blCornerLayerSize = new THREE.Vector2(59, 59).divide(this._ratio);
        const blCornerLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(7));
        blCornerLayerPosition.x = xOrigin + blCornerLayerSize.x / 2 + 5 / this._ratio.x;
        blCornerLayerPosition.z = yOrigin + blCornerLayerSize.y / 2 + 416 / this._ratio.y;
        const blCornerBorderLayer = this._createLayer(GLOW_BORDER_CORNER4_MATERIAL_DEF, blCornerLayerSize,
            blCornerLayerPosition);
        blCornerBorderLayer.renderOrder = renderOrder;
        blCornerBorderLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(blCornerBorderLayer);

        renderOrder++;

        const brCornerLayerSize = new THREE.Vector2(59, 59).divide(this._ratio);
        const brCornerLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(7));
        brCornerLayerPosition.x = xOrigin + brCornerLayerSize.x / 2 + 576 / this._ratio.x;
        brCornerLayerPosition.z = yOrigin + brCornerLayerSize.y / 2 + 416 / this._ratio.y;
        const brCornerBorderLayer = this._createLayer(GLOW_BORDER_CORNER4_MATERIAL_DEF, brCornerLayerSize,
            brCornerLayerPosition);
        brCornerBorderLayer.renderOrder = renderOrder;
        this.add(brCornerBorderLayer);

        renderOrder++;

        const trCornerLayerSize = new THREE.Vector2(59, 59).divide(this._ratio);
        const trCornerLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(28));
        trCornerLayerPosition.x = xOrigin + trCornerLayerSize.x / 2 + 576 / this._ratio.x;
        trCornerLayerPosition.z = yOrigin + trCornerLayerSize.y / 2 + 5 / this._ratio.y;
        const trCornerBorderLayer = this._createLayer(GLOW_BORDER_CORNER3_MATERIAL_DEF, trCornerLayerSize,
            trCornerLayerPosition);
        trCornerBorderLayer.renderOrder = renderOrder;
        trCornerBorderLayer.rotation.x += THREE.Math.degToRad(180);
        trCornerBorderLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(trCornerBorderLayer);

        renderOrder++;

        const tlCornerLayerSize = new THREE.Vector2(59, 59).divide(this._ratio);
        const tlCornerLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(28));
        tlCornerLayerPosition.x = xOrigin + tlCornerLayerSize.x / 2 + 5 / this._ratio.x;
        tlCornerLayerPosition.z = yOrigin + tlCornerLayerSize.y / 2 + 5 / this._ratio.y;
        const tlCornerBorderLayer = this._createLayer(GLOW_BORDER_CORNER3_MATERIAL_DEF, tlCornerLayerSize,
            tlCornerLayerPosition);
        tlCornerBorderLayer.renderOrder = renderOrder;
        tlCornerBorderLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(tlCornerBorderLayer);

        renderOrder++;

        const text3LayerSize = new THREE.Vector2(300, 144).divide(this._ratio);
        const text3LayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(4));
        text3LayerPosition.x = xOrigin + text3LayerSize.x / 2 + 300 / this._ratio.x;
        text3LayerPosition.z = yOrigin + text3LayerSize.y / 2 + 246 / this._ratio.y;
        const text3Layer = this._createTextLayer('100', 'micro', 80, 0x4f5a65, 1, renderOrder);
        text3LayerPosition.x += text3LayerSize.x / 2 - text3Layer.size.x;
        text3Layer.position.copy(text3LayerPosition);
        text3Layer.rotation.copy(this._rotation);
        this.add(text3Layer);

        renderOrder++;

        const bgLeftLayerSize = new THREE.Vector2(289, 28).divide(this._ratio);
        const bgLeftLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(7));
        bgLeftLayerPosition.x = xOrigin + bgLeftLayerSize.x / 2 + 33 / this._ratio.x;
        bgLeftLayerPosition.z = yOrigin + bgLeftLayerSize.y / 2 + 433 / this._ratio.y;
        const bgLeftLayer = this._createLayer(IN_BG_FILL_MATERIAL_DEF, bgLeftLayerSize, bgLeftLayerPosition);
        bgLeftLayer.renderOrder = renderOrder;
        this.add(bgLeftLayer);

        renderOrder++;

        const bgRightLayerSize = new THREE.Vector2(289, 28).divide(this._ratio);
        const bgRightLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(7));
        bgRightLayerPosition.x = xOrigin + bgRightLayerSize.x / 2 + 317 / this._ratio.x;
        bgRightLayerPosition.z = yOrigin + bgRightLayerSize.y / 2 + 433 / this._ratio.y;
        const bgRightLayer = this._createLayer(IN_BG_FILL_MATERIAL_DEF, bgRightLayerSize, bgRightLayerPosition);
        bgRightLayer.renderOrder = renderOrder;
        bgRightLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(bgRightLayer);

        renderOrder++;

        const textTitleLayerSize = new THREE.Vector2(602, 56).divide(this._ratio);
        const textTitleLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(28));
        textTitleLayerPosition.x = xOrigin + textTitleLayerSize.x / 2 - 70 / this._ratio.x;
        textTitleLayerPosition.z = yOrigin + textTitleLayerSize.y / 2 + 10 / this._ratio.y;
        const textTitleLayer = this._createTextLayer('#str_00771', 'micro', 25, 0xffffff, 0.7, renderOrder);
        textTitleLayerPosition.x += textTitleLayerSize.x / 2 - textTitleLayer.size.x;
        textTitleLayer.position.copy(textTitleLayerPosition);
        textTitleLayer.rotation.copy(this._rotation);
        this.add(textTitleLayer);

        renderOrder++;

        const textTitleStationIdLayerSize = new THREE.Vector2(566, 33).divide(this._ratio);
        const textTitleStationIdLayerPosition = this._position.clone().sub(positionOffset.clone().multiplyScalar(6));
        textTitleStationIdLayerPosition.x = xOrigin + textTitleStationIdLayerSize.x / 2 + 6 / this._ratio.x;
        textTitleStationIdLayerPosition.z = yOrigin + textTitleStationIdLayerSize.y / 2 + 431 / this._ratio.y;
        const textTitleStationIdLayer = this._createTextLayer('#str_00772', 'micro', 17, 0xe6f2ff, 0.5, renderOrder);
        textTitleStationIdLayerPosition.x += textTitleStationIdLayerSize.x / 2 - textTitleStationIdLayer.size.x;
        textTitleStationIdLayer.position.copy(textTitleStationIdLayerPosition);
        textTitleStationIdLayer.rotation.copy(this._rotation);
        this.add(textTitleStationIdLayer);

        renderOrder++;

        const outerShadowLayerSize = new THREE.Vector2(640, 480).divide(this._ratio);
        const outerShadowLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(11));
        outerShadowLayerPosition.x = xOrigin + outerShadowLayerSize.x / 2;
        outerShadowLayerPosition.z = yOrigin + outerShadowLayerSize.y / 2;
        const outerShadowLayer = this._createLayer(OUTER_SHADOW_MATERIAL_DEF, outerShadowLayerSize,
            outerShadowLayerPosition);
        outerShadowLayer.renderOrder = renderOrder;
        outerShadowLayer.rotation.y += THREE.Math.degToRad(180);
        this.add(outerShadowLayer);

        renderOrder++;

        const textTitleChargesLayerSize = new THREE.Vector2(291, 33).divide(this._ratio);
        const textTitleChargesLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(9));
        textTitleChargesLayerPosition.x = xOrigin + textTitleChargesLayerSize.x / 2 + 278 / this._ratio.x;
        textTitleChargesLayerPosition.z = yOrigin + textTitleChargesLayerSize.y / 2 + 248 / this._ratio.y;
        const textTitleChargesLayer = this._createTextLayer('#str_00773', 'micro', 19, 0xe6f2ff, 0.5, renderOrder);
        textTitleChargesLayerPosition.x += textTitleChargesLayerSize.x / 2 - textTitleChargesLayer.size.x;
        textTitleChargesLayer.position.copy(textTitleChargesLayerPosition);
        textTitleChargesLayer.rotation.copy(this._rotation);
        this.add(textTitleChargesLayer);

        renderOrder++;

        const bgButtonBtmLayerSize = new THREE.Vector2(521, 186).divide(this._ratio);
        const bgButtonBtmLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(9));
        bgButtonBtmLayerPosition.x = xOrigin + bgButtonBtmLayerSize.x / 2 + 168 / this._ratio.x;
        bgButtonBtmLayerPosition.z = yOrigin + bgButtonBtmLayerSize.y / 2 + 182 / this._ratio.y;
        const bgButtonBtmLayer = this._createLayer(BUTTON2_MATERIAL_DEF, bgButtonBtmLayerSize, bgButtonBtmLayerPosition);
        bgButtonBtmLayer.renderOrder = renderOrder;
        bgButtonBtmLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(bgButtonBtmLayer);

        renderOrder++;

        const bgButtonBorderLayerSize = new THREE.Vector2(123, 29).divide(this._ratio);
        const bgButtonBorderLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(10));
        bgButtonBorderLayerPosition.x = xOrigin + bgButtonBorderLayerSize.x / 2 + 218 / this._ratio.x;
        bgButtonBorderLayerPosition.z = yOrigin + bgButtonBorderLayerSize.y / 2 + 250 / this._ratio.y;
        const bgButtonBorderLayer = this._createLayer(BUTTON2_BAR_MATERIAL_DEF, bgButtonBorderLayerSize, bgButtonBorderLayerPosition);
        bgButtonBorderLayer.renderOrder = renderOrder;
        bgButtonBorderLayer.rotation.x += THREE.Math.degToRad(180);
        this.add(bgButtonBorderLayer);

        renderOrder++;

        const bgButtonTopLayerSize = new THREE.Vector2(521, 186).divide(this._ratio);
        const bgButtonTopLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(17));
        bgButtonTopLayerPosition.x = xOrigin + bgButtonTopLayerSize.x / 2 + 168 / this._ratio.x;
        bgButtonTopLayerPosition.z = yOrigin + bgButtonTopLayerSize.y / 2 + 86 / this._ratio.y;
        const bgButtonTopLayer = this._createLayer(BUTTON2_MATERIAL_DEF, bgButtonTopLayerSize, bgButtonTopLayerPosition);
        bgButtonTopLayer.renderOrder = renderOrder;
        this.add(bgButtonTopLayer);

        renderOrder++;

        const textBtnLayerSize = new THREE.Vector2(321, 103).divide(this._ratio);
        const textBtnLayerPosition = this._position.clone().add(positionOffset.clone().multiplyScalar(16));
        textBtnLayerPosition.x = xOrigin + textBtnLayerSize.x / 2 + 226 / this._ratio.x;
        textBtnLayerPosition.z = yOrigin + textBtnLayerSize.y / 2 + 145 / this._ratio.y;
        const textBtnLayer = this._createTextLayer('#str_00775', 'micro', 25, 0xffffff, 0.2, renderOrder);
        textBtnLayerPosition.x += textBtnLayerSize.x / 2 - textBtnLayer.size.x;
        textBtnLayer.position.copy(textBtnLayerPosition);
        textBtnLayer.rotation.copy(this._rotation);
        this.add(textBtnLayer);
    }

    update(time) {
        super.update(time);
        this._scrollingText.update(time);
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