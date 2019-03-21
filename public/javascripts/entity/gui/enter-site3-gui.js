import {materials} from '../../map/materials.js';
import {Faces} from '../../util/face-utils.js';
import {currentTime} from '../../util/common-utils.js';
import {strings} from '../../strings.js';
import {fonts} from '../../fonts.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

const blackBackgroundMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/cpuserver/bgWhite4',
    color: 0,
    transparent: true,
    opacity: 0.9
};

const blackBackground2MaterialDef = {
    type: 'shader',
    color: 0,
    transparent: true,
    opacity: 0.9
};

const adminbg1MaterialDef = {
    clamp: true,
    type: 'shader',
    diffuseMap: 'guis/assets/doors/adminbg',
    color: 0x99cccc,
    transparent: true,
    repeat: [0.9, 0.7],
};

const adminbg2MaterialDef = {
    clamp: true,
    type: 'shader',
    diffuseMap: 'guis/assets/doors/adminbg',
    color: 0x99cccc,
    transparent: true,
    opacity: 1,
    repeat: [0.9, 0.79],
};

const titleBarCornerMaterialDef = {
    clamp: true,
    type: 'shader',
    diffuseMap: 'guis/assets/common/titlebar_corner',
    color: 0x99ccd9,
    transparent: true,
    opacity: 0.3
};

const titleBarMidMaterialDef = {
    clamp: true,
    type: 'shader',
    diffuseMap: 'guis/assets/common/titlebar_mid',
    color: 0x99ccd9,
    transparent: true,
    opacity: 0.3
};

const btn2PxBorderHorizMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/btn_2pxborder_horiz',
    color: 0x80ffe6,
    transparent: true,
    opacity: 0.2
};

const titlebarMidMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/titlebar_mid',
    color: 0x80ffe6,
    transparent: true,
    opacity: 0.2
};

const bglowMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/cpuserver/bglow',
    color: 0x80e699,
    transparent: true,
    opacity: 0.1
};

const outerglowMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/outerglow',
    color: 0xffffff,
    transparent: true,
    opacity: {expression: 'table("pdflick", time * 0.0025) / 6'}
};

const outershadowMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/outershadow',
    color: 0xffffff,
    transparent: true
};

const dirt4MaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/dirt4',
    transparent: true,
    opacity: 0.2
};

const dirt2MaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/common/dirt2',
    transparent: true,
    opacity: 0.5
};

const maskMaterialDef = {
    type: 'shader',
    diffuseMap: 'guis/assets/test/mask',
    transparent: true,
    opacity: 0.1
};

export class EnterSite3Gui extends THREE.Group {
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

        const halfOfScreenHeight = SCREEN_HEIGHT / 2 / ratio.y;

        // To compute screen position we should find half of the diagonal distance
        const halfDistance = v1.distanceTo(v2) / 2;
        // then find displacement vector
        const displacement = v1.clone().sub(v2).normalize().multiplyScalar(halfDistance);
        // and finally move one of the diagonal vertices
        const position = v1.clone().sub(displacement);

        let xOffset = 0;
        const xOffsetStep = 0.01;

        let renderOrder = 0;

        const bgBlackLayer = this._createLayer(blackBackgroundMaterialDef,
            new THREE.Vector2(SCREEN_WIDTH, SCREEN_HEIGHT).divide(ratio),
            position.clone().setZ(position.z - 10 / ratio.y));
        bgBlackLayer.renderOrder = renderOrder;
        this.add(bgBlackLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circle0Layer = this._createLayer(materials['gui/spin1alt'], new THREE.Vector2(578, 361).divide(ratio),
            position.clone().setX(position.x - xOffset));
        circle0Layer.renderOrder = renderOrder;
        this._materials.push(circle0Layer.material);
        this.add(circle0Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circle1Layer = this._createLayer(materials['gui/spin2alt'], new THREE.Vector2(578, 361).divide(ratio),
            position.clone().setX(position.x - xOffset));
        circle1Layer.renderOrder = renderOrder;
        this._materials.push(circle1Layer.material);
        this.add(circle1Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circle2Layer = this._createLayer(materials['gui/spin3alt'], new THREE.Vector2(528, 361).divide(ratio),
            position.clone().setX(position.x - xOffset));
        circle2Layer.renderOrder = renderOrder;
        this._materials.push(circle2Layer.material);
        this.add(circle2Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circle3Layer = this._createLayer(materials['gui/spin4alt'], new THREE.Vector2(478, 361).divide(ratio),
            position.clone().setX(position.x - xOffset));
        circle3Layer.renderOrder = renderOrder;
        this._materials.push(circle3Layer.material);
        this.add(circle3Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circCropBlack1Size = new THREE.Vector2(562, 133).divide(ratio);
        const circCropBlack1Position = position.clone().setX(position.x - xOffset);
        circCropBlack1Position.setZ(circCropBlack1Position.z - halfOfScreenHeight + circCropBlack1Size.y / 2);
        circCropBlack1Position.setZ(circCropBlack1Position.z + 10 / ratio.y);
        const circCropBlack1Layer = this._createLayer(blackBackgroundMaterialDef, circCropBlack1Size,
            circCropBlack1Position);
        circCropBlack1Layer.renderOrder = renderOrder;
        this.add(circCropBlack1Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circCropBlack21Size = new THREE.Vector2(569, 128).divide(ratio);
        const circCropBlack21Position = position.clone().setX(position.x - xOffset);
        circCropBlack21Position.setZ(circCropBlack21Position.z + halfOfScreenHeight - circCropBlack21Size.y / 2);
        circCropBlack21Position.setZ(circCropBlack21Position.z - 20 / ratio.y);
        const circCropBlack21Layer = this._createLayer(blackBackgroundMaterialDef, circCropBlack21Size,
            circCropBlack21Position);
        circCropBlack21Layer.renderOrder = renderOrder;
        this.add(circCropBlack21Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const bg1Size = new THREE.Vector2(580, 200).divide(ratio);
        const bg1Position = position.clone().setX(position.x - xOffset);
        bg1Position.setZ(bg1Position.z - bg1Size.y / 2);
        const bg1Layer = this._createLayer(adminbg1MaterialDef, bg1Size, bg1Position);
        bg1Layer.renderOrder = renderOrder;
        this.add(bg1Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const bg3Size = new THREE.Vector2(580, 200).divide(ratio);
        const bg3Position = position.clone().setX(position.x - xOffset);
        bg3Position.setZ(bg3Position.z + bg3Size.y / 2);
        const bg3Layer = this._createLayer(adminbg2MaterialDef, bg3Size, bg3Position);
        bg3Layer.rotateX(THREE.Math.degToRad(180));
        bg3Layer.renderOrder = renderOrder;
        this.add(bg3Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const bg11Size = new THREE.Vector2(580, 200).divide(ratio);
        const bg11Position = position.clone().setX(position.x - xOffset);
        bg11Position.setZ(bg11Position.z - bg11Size.y / 2);
        const bg11Layer = this._createLayer(adminbg1MaterialDef, bg11Size, bg11Position);
        bg11Layer.rotateY(THREE.Math.degToRad(180));
        bg11Layer.renderOrder = renderOrder;
        this.add(bg11Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const bg31Size = new THREE.Vector2(580, 200).divide(ratio);
        const bg31Position = position.clone().setX(position.x - xOffset);
        bg31Position.setZ(bg31Position.z + bg31Size.y / 2);
        const bg31Layer = this._createLayer(adminbg2MaterialDef, bg31Size, bg31Position);
        bg31Layer.rotateX(THREE.Math.degToRad(180));
        bg31Layer.rotateY(THREE.Math.degToRad(180));
        bg31Layer.renderOrder = renderOrder;
        this.add(bg31Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circCropBlack2Size = new THREE.Vector2(580, 32).divide(ratio);
        const circCropBlack2Position = position.clone().setX(position.x - xOffset);
        circCropBlack2Position
            .setZ(circCropBlack2Position.z + halfOfScreenHeight - circCropBlack2Size.y - 8 / ratio.y);
        const circCropBlack2Layer = this._createLayer(blackBackground2MaterialDef, circCropBlack2Size,
            circCropBlack2Position);
        circCropBlack2Layer.renderOrder = renderOrder;
        this.add(circCropBlack2Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const circCropBlack11Size = new THREE.Vector2(580, 28).divide(ratio);
        const circCropBlack11Position = position.clone().setX(position.x - xOffset);
        circCropBlack11Position.setZ(circCropBlack11Position.z - halfOfScreenHeight + circCropBlack11Size.y);
        const circCropBlack11Layer = this._createLayer(blackBackground2MaterialDef, circCropBlack11Size,
            circCropBlack11Position);
        circCropBlack11Layer.renderOrder = renderOrder;
        this.add(circCropBlack11Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const sourceTextLayer = this._createTextLayer('#str_04006', 'micro', 26, 0.5, renderOrder, ratio);
        sourceTextLayer.position.copy(position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - sourceTextLayer.size.x / 2)
            .setZ(position.z - 180 / ratio.y));
        sourceTextLayer.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(-90), 0);
        this.add(sourceTextLayer);

        const bar1LeftSize = new THREE.Vector2(35, 32).divide(ratio);
        const bar1LeftPosition = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - 279 / ratio.x)
            .setZ(position.z - 212 / ratio.y);
        const bar1LeftLayer = this._createLayer(titleBarCornerMaterialDef, bar1LeftSize, bar1LeftPosition);
        bar1LeftLayer.rotation.y = THREE.Math.degToRad(90);
        bar1LeftLayer.renderOrder = renderOrder;
        this.add(bar1LeftLayer);

        const bar1MidSize = new THREE.Vector2(523, 32).divide(ratio);
        const bar1MidPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 212 / ratio.y);
        const bar1MidLayer = this._createLayer(titleBarMidMaterialDef, bar1MidSize, bar1MidPosition);
        bar1MidLayer.renderOrder = renderOrder;
        this.add(bar1MidLayer);

        const bar1RightSize = new THREE.Vector2(35, 32).divide(ratio);
        const bar1RightPosition = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y + 279 / ratio.x)
            .setZ(position.z - 212 / ratio.y);
        const bar1RightLayer = this._createLayer(titleBarCornerMaterialDef, bar1RightSize, bar1RightPosition);
        bar1RightLayer.renderOrder = renderOrder;
        this.add(bar1RightLayer);

        const statusbar2LeftSize = new THREE.Vector2(35, 32).divide(ratio);
        const statusbar2LeftPosition = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - 279 / ratio.x)
            .setZ(position.z + 198 / ratio.y);
        const statusbar2LeftLayer = this._createLayer(titleBarCornerMaterialDef, statusbar2LeftSize,
            statusbar2LeftPosition);
        statusbar2LeftLayer.rotation.z = THREE.Math.degToRad(180);
        statusbar2LeftLayer.renderOrder = renderOrder;
        this.add(statusbar2LeftLayer);

        const statusbar2MidSize = new THREE.Vector2(523, 32).divide(ratio);
        const statusbar2MidPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z + 198 / ratio.y);
        const statusbar2MidLayer = this._createLayer(titleBarMidMaterialDef, statusbar2MidSize, statusbar2MidPosition);
        statusbar2MidLayer.renderOrder = renderOrder;
        this.add(statusbar2MidLayer);

        const statusbar2RightSize = new THREE.Vector2(35, 32).divide(ratio);
        const statusbar2RightPosition = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y + 279 / ratio.x)
            .setZ(position.z + 198 / ratio.y);
        const statusbar2RightLayer = this._createLayer(titleBarCornerMaterialDef, statusbar2RightSize,
            statusbar2RightPosition);
        statusbar2RightLayer.rotation.y = THREE.Math.degToRad(90);
        statusbar2RightLayer.rotation.z = THREE.Math.degToRad(180);
        statusbar2RightLayer.renderOrder = renderOrder;
        this.add(statusbar2RightLayer);

        const text41Layer = this._createTextLayer('#str_02989', 'micro', 32, 1, renderOrder, ratio);
        text41Layer.position.copy(position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - text41Layer.size.x / 2)
            .setZ(position.z + 150 / ratio.y));
        text41Layer.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(-90), 0);
        this.add(text41Layer);

        const btn2TopSize = new THREE.Vector2(492, 34).divide(ratio);
        const btn2TopPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 145 / ratio.y);
        const btn2TopLayer = this._createLayer(btn2PxBorderHorizMaterialDef, btn2TopSize, btn2TopPosition);
        btn2TopLayer.rotation.z = THREE.Math.degToRad(180);
        btn2TopLayer.renderOrder = renderOrder;
        this.add(btn2TopLayer);

        const btn2BtmSize = new THREE.Vector2(492, 22).divide(ratio);
        const btn2BtmPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 117 / ratio.y);
        const materialDef = Object.assign(btn2PxBorderHorizMaterialDef);
        materialDef.clamp = true;
        materialDef.translate = [0, 0.4];
        const btn2BtmLayer = this._createLayer(materialDef, btn2BtmSize, btn2BtmPosition);
        btn2BtmLayer.renderOrder = renderOrder;
        this.add(btn2BtmLayer);

        const destBar2Size = new THREE.Vector2(104, 30).divide(ratio);
        const destBar2Position = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y + 195 / ratio.x)
            .setZ(position.z + 108 / ratio.y);
        const destBar2Layer = this._createLayer(titlebarMidMaterialDef, destBar2Size, destBar2Position);
        destBar2Layer.renderOrder = renderOrder;
        this.add(destBar2Layer);

        const destBar1Size = new THREE.Vector2(104, 30).divide(ratio);
        const destBar1Position = position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - 195 / ratio.x)
            .setZ(position.z + 108 / ratio.y);
        const destBar1Layer = this._createLayer(titlebarMidMaterialDef, destBar1Size, destBar1Position);
        destBar1Layer.renderOrder = renderOrder;
        this.add(destBar1Layer);

        const textCurrentLocLayer = this._createTextLayer('#str_04007', 'bank', 15.5, 1, renderOrder, ratio);
        textCurrentLocLayer.position.copy(position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - textCurrentLocLayer.size.x / 2)
            .setZ(position.z + 108 / ratio.y));
        textCurrentLocLayer.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(-90), 0);
        this.add(textCurrentLocLayer);

        const textBtn2Layer = this._createTextLayer('#str_04008', 'micro', 42, 0.4, renderOrder, ratio);
        textBtn2Layer.position.copy(position.clone()
            .setX(position.x - xOffset)
            .setY(position.y - textBtn2Layer.size.x / 2)
            .setZ(position.z - 35 / ratio.y));
        textBtn2Layer.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(-90), 0);
        this.add(textBtn2Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const bglowSize = new THREE.Vector2(600, 430).divide(ratio);
        const bglowPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const bglowLayer = this._createLayer(bglowMaterialDef, bglowSize, bglowPosition);
        bglowLayer.renderOrder = renderOrder;
        this.add(bglowLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const staticMaterials = materials['gui/static'];
        const staticSize = new THREE.Vector2(600, 430).divide(ratio);
        const staticPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        for (let material of staticMaterials) {
            const materialDef = Object.assign(material);
            materialDef.opacity = {expression: 'table("pdhalffade", time * 0.001) / 10'};
            materialDef.color = 0xffffff;
            const layer = this._createLayer(material, staticSize, staticPosition);
            layer.renderOrder = renderOrder;
            this.add(layer);
            this._materials.push(layer.material);
            renderOrder++;
        }

        xOffset += xOffsetStep;

        const outerglowSize = new THREE.Vector2(610, 436).divide(ratio);
        const outerglowPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const outerglowLayer = this._createLayer(outerglowMaterialDef, outerglowSize, outerglowPosition);
        outerglowLayer.renderOrder = renderOrder;
        this._materials.push(outerglowLayer.material);
        this.add(outerglowLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const outershadowSize = new THREE.Vector2(610, 436).divide(ratio);
        const outershadowPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const outershadowLayer = this._createLayer(outershadowMaterialDef, outershadowSize, outershadowPosition);
        outershadowLayer.renderOrder = renderOrder;
        this.add(outershadowLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const addhighlight2Size = new THREE.Vector2(610, 238).divide(ratio);
        const addhighlight2Position = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z + 98 / ratio.y);
        const addhighlight2MaterialDef = Object.assign(materials['gui/addhighlight']);
        addhighlight2MaterialDef.color = 0x668080;
        addhighlight2MaterialDef.opacity = 1;
        const addhighlight2Layer = this._createLayer(addhighlight2MaterialDef, addhighlight2Size, addhighlight2Position);
        addhighlight2Layer.renderOrder = renderOrder;
        addhighlight2Layer.rotation.z = THREE.Math.degToRad(180);
        this.add(addhighlight2Layer);

        const addhighlightSize = new THREE.Vector2(610, 238).divide(ratio);
        const addhighlightPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 115 / ratio.y);
        const addhighlightMaterialDef = Object.assign(materials['gui/addhighlight']);
        addhighlightMaterialDef.color = 0x266680;
        addhighlightMaterialDef.opacity = 1;
        const addhighlightLayer = this._createLayer(addhighlightMaterialDef, addhighlightSize, addhighlightPosition);
        addhighlightLayer.renderOrder = renderOrder;
        this.add(addhighlightLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const scanlinesSize = new THREE.Vector2(605, 450).divide(ratio);
        const scanlinesPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const scanlinesLayer = this._createLayer(materials['gui/test/gui_scanlines'], scanlinesSize,
            scanlinesPosition, 1.5);
        scanlinesLayer.renderOrder = renderOrder;
        scanlinesLayer.rotation.z = THREE.Math.degToRad(180);
        this._materials.push(scanlinesLayer.material);
        this.add(scanlinesLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const dirtSize = new THREE.Vector2(610, 450).divide(ratio);
        const dirtPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const dirtLayer = this._createLayer(dirt4MaterialDef, dirtSize, dirtPosition);
        dirtLayer.renderOrder = renderOrder;
        this.add(dirtLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const reflectSize = new THREE.Vector2(640, 460).divide(ratio);
        const reflectPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 15 / ratio.y);
        const reflectLayer = this._createLayer(materials['gui/reflect1'], reflectSize, reflectPosition);
        reflectLayer.renderOrder = renderOrder;
        this._materials.push(reflectLayer.material);
        this.add(reflectLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const scanlinesAltSize = new THREE.Vector2(605, 450).divide(ratio);
        const scanlinesAltPosition = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const scanlinesAltMaterialDef = Object.assign(materials['gui/test/gui_scanlines5']);
        scanlinesAltMaterialDef.color = 0x1a1a1a;
        const scanlinesAltLayer = this._createLayer(scanlinesAltMaterialDef, scanlinesAltSize, scanlinesAltPosition, 2);
        scanlinesAltLayer.renderOrder = renderOrder;
        scanlinesAltLayer.rotation.z = THREE.Math.degToRad(180);
        this._materials.push(scanlinesAltLayer.material);
        this.add(scanlinesAltLayer);

        xOffset += xOffsetStep;
        renderOrder++;

        const dirt1Size = new THREE.Vector2(610, 460).divide(ratio);
        const dirt1Position = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const dirt1Layer = this._createLayer(dirt2MaterialDef, dirt1Size, dirt1Position, 2);
        dirt1Layer.renderOrder = renderOrder;
        this.add(dirt1Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const mask1Size = new THREE.Vector2(610, 450).divide(ratio);
        const mask1Position = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const mask1Layer = this._createLayer(maskMaterialDef, mask1Size, mask1Position, 2);
        mask1Layer.renderOrder = renderOrder;
        this.add(mask1Layer);

        xOffset += xOffsetStep;
        renderOrder++;

        const dirt2Size = new THREE.Vector2(610, 450).divide(ratio);
        const dirt2Position = position.clone()
            .setX(position.x - xOffset)
            .setZ(position.z - 7.5 / ratio.y);
        const dirt4MaterialDefClone = Object.assign(dirt4MaterialDef);
        dirt4MaterialDefClone.opacity = 0.8;
        const dirt2Layer = this._createLayer(dirt4MaterialDefClone, dirt2Size, dirt2Position, 2);
        dirt2Layer.renderOrder = renderOrder;
        this.add(dirt2Layer);
    }

    _createLayer(materialDefinition, size, position, yScale) {
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
        if (materialDefinition) {
            material = materialBuilder.build(materialDefinition.diffuseMap, materialDefinition);
            material.update(currentTime());
        } else
            material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
        const layerMesh = new THREE.Mesh(geometry, material);
        layerMesh.position.copy(position);
        layerMesh.rotation.set(THREE.Math.degToRad(-90), THREE.Math.degToRad(-90), 0);
        return layerMesh;
    }

    _createTextLayer(textCode, font, fontSize, opacity, renderOrder, screenRatio) {
        const textLayer = new THREE.Group();
        textLayer.renderOrder = renderOrder;
        textLayer.size = new THREE.Vector2();

        const textString = strings[textCode];
        let textWidth = 0;
        for (let i = 0; i < textString.length; i++) {
            const charCode = textString.charCodeAt(i);
            const letter = fonts[font][charCode];
            if (!letter)
                console.error('Font "' + font + '" does not support character with code ' + charCode);
            else {
                const letterSize = new THREE.Vector2(letter.size[0] * fontSize * 0.8, letter.size[1] * fontSize)
                    .divide(screenRatio);
                const letterPosition = new THREE.Vector3(textWidth + letterSize.x / 2, 0, 0);
                let materialDef = null;
                if (letter.material) {
                    materialDef = Object.assign({}, letter.material);
                    materialDef.opacity = opacity;
                }
                const letterLayer = this._createLayer(materialDef, letterSize, letterPosition);
                letterLayer.rotation.set(0, 0, 0);
                letterLayer.renderOrder = renderOrder;
                textLayer.add(letterLayer);
                textWidth += letterSize.x
            }
        }

        textLayer.size.x = textWidth;
        return textLayer;
    }

    update(time) {
        for (let material of this._materials)
            material.update(time);
        for (let animation of this._animations)
            animation.update(time);
    }
}