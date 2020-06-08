import {MATERIALS} from '../../material/materials.js';
import {AbstractGui} from './abstract-gui.js';

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 480;

export const ENTER_SITE3_GUI = {
    width: 640,
    height: 480,
    layers: [
        {
            type: 'regular',
            material: 'gui/cpuserver/bgwhite4',
            offset: [0, -10]
        },
        {
            type: 'regular',
            material: 'gui/spin1alt',
            size: [578, 361]
        },
        {
            type: 'regular',
            material: 'gui/spin2alt',
            size: [578, 361]
        },
        {
            type: 'regular',
            material: 'gui/spin3alt',
            size: [528, 361]
        },
        {
            type: 'regular',
            material: 'gui/spin4alt',
            size: [478, 361]
        },
        {
            type: 'regular',
            material: 'gui/cpuserver/bgwhite4',
            size: [562, 133],
            offset: [0, -163.5]
        },
        {
            type: 'regular',
            material: 'gui/cpuserver/bgwhite4',
            size: [569, 128],
            offset: [0, 156]
        },
        {
            type: 'regular',
            material: 'gui/doors/adminbg1',
            size: [580, 200],
            offset: [0, -100]
        },
        {
            type: 'regular',
            material: 'gui/doors/adminbg2',
            size: [580, 200],
            offset: [0, 100],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/doors/adminbg1',
            size: [580, 200],
            offset: [0, -100],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/doors/adminbg2',
            size: [580, 200],
            offset: [0, 100],
            rotation: [180, 180]
        },
        {
            type: 'regular',
            material: 'gui/bgblack',
            size: [580, 32],
            offset: [0, 200]
        },
        {
            type: 'regular',
            material: 'gui/bgblack',
            size: [580, 28],
            offset: [0, -212]
        },
        {
            type: 'text',
            text: '#str_04006',
            font: 'micro',
            transparent: true,
            fontSize: 26,
            opacity: 0.5,
            offset: [0, -180],
            rotation: [-90, -90],
            textAlign: 'center'
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_corner',
            size: [35, 32],
            offset: [-279, -212],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_mid',
            size: [523, 32],
            offset: [0, -212]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_corner',
            size: [35, 32],
            offset: [279, -212]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_corner',
            size: [35, 32],
            offset: [-279, 198],
            rotation: [180, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_mid',
            size: [523, 32],
            offset: [0, 198]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_corner',
            size: [35, 32],
            offset: [279, 198],
            rotation: [180, 0]
        },
        {
            type: 'text',
            text: '#str_02989',
            font: 'micro',
            fontSize: 32,
            transparent: true,
            opacity: 1.0,
            size: [35, 32],
            offset: [0, 150],
            rotation: [-90, -90],
            textAlign: 'center'
        },
        {
            type: 'regular',
            material: 'gui/common/btn_2pxborder_horiz1',
            size: [492, 34],
            offset: [0, -145],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/common/btn_2pxborder_horiz2',
            size: [492, 22],
            offset: [0, -117]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_mid',
            size: [104, 30],
            offset: [195, 108]
        },
        {
            type: 'regular',
            material: 'gui/common/titlebar_mid',
            size: [104, 30],
            offset: [-195, 108]
        },
        {
            type: 'text',
            text: '#str_04007',
            font: 'bank',
            fontSize: 15.5,
            transparent: true,
            opacity: 1.0,
            offset: [0, 108],
            rotation: [-90, -90],
            textAlign: 'center'
        },
        {
            type: 'text',
            text: '#str_04008',
            font: 'micro',
            fontSize: 42,
            transparent: true,
            opacity: 0.4,
            offset: [0, -35],
            rotation: [-90, -90],
            textAlign: 'center'
        },
        {
            type: 'regular',
            material: 'gui/cpuserver/bglow',
            size: [600, 430],
            offset: [0, -7.5]
        },
        {
            type: 'regular',
            material: 'gui/static2',
            size: [600, 430],
            offset: [0, -7.5]
        },
        {
            type: 'regular',
            material: 'gui/common/outerglow',
            size: [610, 436],
            offset: [0, -7.5]
        },
        {
            type: 'regular',
            material: 'gui/common/outershadow',
            size: [610, 436],
            offset: [0, -7.5]
        },
        {
            type: 'regular',
            material: 'gui/addhighlight2',
            size: [610, 238],
            offset: [0, 98],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/addhighlight3',
            size: [610, 238],
            offset: [0, -115],
        },
        {
            type: 'regular',
            material: 'gui/test/gui_scanlines',
            size: [605, 450],
            offset: [0, -7.5],
            scale: [0, 1.5],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/common/dirt4',
            size: [610, 450],
            offset: [0, -7.5]
        },
        {
            type: 'regular',
            material: 'gui/reflect1',
            size: [640, 460],
            offset: [0, -15]
        },
        {
            type: 'regular',
            material: 'gui/test/gui_scanlines52',
            size: [605, 450],
            offset: [0, -7.5],
            scale: [0, 2],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/common/dirt2',
            size: [610, 460],
            offset: [0, -7.5],
            scale: [0, 2]
        },
        {
            type: 'regular',
            material: 'gui/test/mask',
            size: [610, 450],
            offset: [0, -7.5],
            scale: [0, 2]
        },
        {
            type: 'regular',
            material: 'gui/common/dirt42',
            size: [610, 450],
            offset: [0, -7.5],
            scale: [0, 2]
        }
    ]
};

export class EnterSite3Gui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);

        // TODO: Make offset along face normal (see Malfunction2Gui for details)
        let xOffset = 0;
        const xOffsetStep = 0.001;

        let renderOrder = 0;

        // Manual fix of screen position
        this._position.setY(this._position.y + 0.3);

        for (let layer of ENTER_SITE3_GUI.layers) {
            let layerMesh = null;

            const offsetX = layer.offset != null ? layer.offset[0] : 0;
            const offsetY = layer.offset != null ? layer.offset[1] : 0;
            const position = this._position.clone()
                .setX(this._position.x - xOffset)
                .setY(this._position.y + offsetX / this._ratio.x)
                .setZ(this._position.z + offsetY / this._ratio.y);

            if (layer.type === 'text') {
                layerMesh = this._createTextLayer(layer.text, layer.font, layer.fontSize, undefined, layer.opacity,
                    renderOrder++);
                if (layer.textAlign === 'center') {
                    position.setY(position.y - layerMesh.size.x / 2)
                }
                layerMesh.position.copy(position);
            } else {
                const width = layer.size != null ? layer.size[0] : ENTER_SITE3_GUI.width;
                const height = layer.size != null ? layer.size[1] : ENTER_SITE3_GUI.height;
                const size = new THREE.Vector2(width, height).divide(this._ratio);
                const scaleY = layer.scale != null ? layer.scale[1] : null;

                const material = MATERIALS[layer.material];
                if (Array.isArray(material)) {
                    for (let m of material) {
                        const mesh = this._createLayer(m, size, position, scaleY);
                        mesh.renderOrder = renderOrder++;
                        this.add(mesh);
                        this._materials.push(mesh.material);
                    }
                } else {
                    layerMesh = this._createLayer(material, size, position, scaleY);
                    layerMesh.renderOrder = renderOrder++;
                    this._materials.push(layerMesh.material);
                }
            }

            if (layerMesh != null) {
                if (layer.rotation != null) {
                    layerMesh.rotateX(THREE.Math.degToRad(layer.rotation[0]));
                    layerMesh.rotateY(THREE.Math.degToRad(layer.rotation[1]));
                }
                this.add(layerMesh);
            }

            xOffset += xOffsetStep;
        }
    }

    update(time) {
        for (let material of this._materials) {
            if (material.update) {
                material.update(time);
            }
        }
        for (let animation of this._animations)
            animation.update(time);
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
