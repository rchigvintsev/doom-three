import {AbstractGui} from './abstract-gui.js';
import {MATERIALS} from '../../material/materials.js';
import {ScrollingText} from "./scrolling-text.js";

export const HEALTH_STATION_GUI = {
    width: 640,
    height: 480,
    layers: [
        {
            type: 'regular',
            material: 'gui/cpuserver/bg',
            size: [1280, 480]
        },
        {
            type: 'regular',
            material: 'gui/health/ekg2flat',
            size: [135, 36],
            offset: [-226.5, 49]
        },
        {
            type: 'regular',
            material: 'gui/health/ekg3flat2',
            size: [135, 36],
            offset: [-226.5, -23]
        },
        {
            type: 'regular',
            material: 'gui/health/ekgflat',
            size: [134, 80],
            offset: [-226, -107]
        },
        {
            type: 'regular',
            material: 'gui/common/1pxborder_cornersm',
            size: [82, 30],
            offset: [-188, -135],
            rotation: [180, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/1pxborder_cornersm',
            size: [82, 30],
            offset: [-188, 112],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/1pxborder_vert',
            size: [82, 217],
            offset: [-188, -11.5],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/1pxborder_horiz',
            size: [71, 30],
            offset: [-264.5, -137]
        },
        {
            type: 'regular',
            material: 'gui/common/1pxborder_horiz',
            size: [71, 30],
            offset: [-264.5, 114],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/common/scibox/fillboxcap',
            size: [252, 25],
            offset: [-232, -140.5]
        },
        {
            type: 'regular',
            material: 'gui/common/scibox/fillboxcenter',
            size: [252, 234],
            offset: [-231, -11],
        },
        {
            type: 'regular',
            material: 'gui/common/scibox/fillboxcap',
            size: [252, 28],
            offset: [-232, 119],
            rotation: [180, 0]
        },
        {
            type: 'text',
            text: '0',
            font: 'micro',
            size: [133, 40],
            fontSize: 25,
            transparent: true,
            opacity: 0.7,
            offset: [-230.5, -62],
            scale: [0.7, 1.0],
            textAlign: 'right'
        },
        {
            type: 'text',
            text: '0 / 0',
            font: 'micro',
            size: [133, 40],
            fontSize: 18,
            transparent: true,
            opacity: 0.5,
            offset: [-232.5, 4],
            scale: [0.7, 1.0],
            textAlign: 'right'
        },
        {
            type: 'text',
            text: '0 / 0',
            font: 'micro',
            size: [133, 59],
            fontSize: 18,
            transparent: true,
            opacity: 0.5,
            offset: [-232.5, 74.5],
            scale: [0.7, 1.0],
            textAlign: 'right'
        },
        {
            type: 'text',
            text: '0',
            font: 'micro',
            size: [133, 59],
            fontSize: 18,
            transparent: true,
            opacity: 0.5,
            offset: [-232.5, 94.5],
            scale: [0.7, 1.0],
            textAlign: 'right'
        },
        {
            type: 'scrolling-text',
            text: '#str_00770',
            font: 'micro',
            size: [317, 32],
            fontSize: 18,
            color: 0xb2e5ff,
            transparent: true,
            opacity: 0.5,
            offset: [296, 170],
            boundaries: [-227.48, 232.86]
        },
        {
            type: 'regular',
            material: 'gui/caverns/cranebox',
            size: [489, 208],
            offset: [-56.5, 87],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/health/circle',
            size: [590, 440],
            offset: [82, -11]
        },
        {
            type: 'regular',
            material: 'gui/health/circle3',
            size: [538, 401],
            offset: [82, -12.5]
        },
        {
            type: 'regular',
            material: 'gui/bgblack2',
            size: [221, 346],
            offset: [194.5, -13]
        },
        {
            type: 'regular',
            material: 'gui/health/line',
            size: [214, 30],
            offset: [191, -170]
        },
        {
            type: 'regular',
            material: 'gui/health/line',
            size: [214, 30],
            offset: [191, 148]
        },
        {
            type: 'regular',
            material: 'gui/health/line2',
            size: [214, 27],
            offset: [191, -156.5]
        },
        {
            type: 'regular',
            material: 'gui/health/line2',
            size: [214, 27],
            offset: [191, 133.5]
        },
        {
            type: 'regular',
            material: 'gui/caverns/cranebox2',
            size: [489, 191],
            offset: [-56.5, 92.5],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/caverns/cranebox2',
            size: [489, 191],
            offset: [-56.5, -113.5]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_vert',
            size: [59, 352],
            offset: [285.5, 0],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_vert',
            size: [59, 352],
            offset: [-285.5, 0]
        },
        {
            type: 'regular',
            material: 'gui/glowborder_horiz',
            size: [512, 59],
            offset: [0, -205.5],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/glowborder_horiz',
            size: [512, 59],
            offset: [0, 205.5]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_corner4',
            size: [59, 59],
            offset: [-285.5, 205.5],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_corner4',
            size: [59, 59],
            offset: [285.5, 205.5]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_corner3',
            size: [59, 59],
            offset: [285.5, -205.5],
            rotation: [180, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/glowborder_corner3',
            size: [59, 59],
            offset: [-285.5, -205.5],
            rotation: [180, 0]
        },
        {
            type: 'text',
            text: '100',
            font: 'micro',
            size: [300, 144],
            fontSize: 80,
            color: 0x4f5a65,
            transparent: true,
            opacity: 1.0,
            offset: [130, 78],
            textAlign: 'right'
        },
        {
            type: 'regular',
            material: 'gui/airlock/inbgfill',
            size: [289, 28],
            offset: [-142.5, 207]
        },
        {
            type: 'regular',
            material: 'gui/airlock/inbgfill',
            size: [289, 28],
            offset: [141.5, 207],
            rotation: [0, 180]
        },
        {
            type: 'text',
            text: '#str_00771',
            font: 'micro',
            size: [602, 56],
            fontSize: 25,
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            offset: [-89, -202],
            textAlign: 'right'
        },
        {
            type: 'text',
            text: '#str_00772',
            font: 'micro',
            size: [566, 33],
            fontSize: 17,
            color: 0xe6f2ff,
            transparent: true,
            opacity: 0.5,
            offset: [-31, 207.5],
            textAlign: 'right'
        },
        {
            type: 'regular',
            material: 'gui/common/outershadow',
            size: [640, 480],
            offset: [0, 0]
        },
        {
            type: 'text',
            text: '#str_00773',
            font: 'micro',
            size: [291, 33],
            fontSize: 19,
            color: 0xe6f2ff,
            transparent: true,
            opacity: 0.5,
            offset: [103.5, 24.5],
            textAlign: 'right'
        },
        {
            type: 'regular',
            material: 'gui/health/button2',
            size: [521, 186],
            offset: [108.5, 35],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/health/button2bar',
            size: [123, 29],
            offset: [-40.5, 24.5],
            rotation: [180, 0]
        },
        {
            type: 'regular',
            material: 'gui/health/button2',
            size: [521, 186],
            offset: [108.5, -61]
        },
        {
            type: 'text',
            text: '#str_00775',
            font: 'micro',
            size: [321, 103],
            fontSize: 25,
            color: 0xffffff,
            transparent: true,
            opacity: {expression: 'table("pdhalffade2", time * 0.3)'},
            offset: [66.5, -43.5],
            textAlign: 'right'
        },
        {
            type: 'regular',
            material: 'gui/static3',
            size: [660, 500],
            offset: [2, 2],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/outershadow',
            size: [640, 480],
            offset: [0, 0],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/common/dirt4_3',
            size: [640, 480],
            offset: [0, 0],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/test/gui_scanlines5_3',
            size: [640, 480],
            offset: [0, 0],
            rotation: [180, 180]
        },
        {
            type: 'regular',
            material: 'gui/addhighlight4',
            size: [640, 480],
            offset: [0, 0],
            rotation: [0, 180]
        },
        {
            type: 'regular',
            material: 'gui/cpuserver/bglow2',
            size: [640, 480],
            offset: [0, 0],
            rotation: [0, 180]
        }
    ]
}

export class HealthStationGui extends AbstractGui {
    constructor(parent, materialIndex, materialBuilder) {
        super(parent, materialIndex, materialBuilder);

        // Prepare position offset to prevent texture flickering
        const offsetMask = new THREE.Vector3(0, 0, 1);
        const offset = new THREE.Vector3().setScalar(-0.10).multiply(offsetMask);
        const offsetStep = new THREE.Vector3().setScalar(0.001).multiply(offsetMask)

        let renderOrder = 0;
        
        for (let layer of HEALTH_STATION_GUI.layers) {
            let layerMesh = null;

            const width = layer.size != null ? layer.size[0] : HEALTH_STATION_GUI.width;
            const height = layer.size != null ? layer.size[1] : HEALTH_STATION_GUI.height;
            const size = new THREE.Vector2(width, height).divide(this._ratio);

            const offsetX = layer.offset != null ? layer.offset[0] : 0;
            const offsetY = layer.offset != null ? layer.offset[1] : 0;
            const position = new THREE.Vector3()
                .add(offset)
                .setX(offsetX / this._ratio.x)
                .setY(offsetY * -1 / this._ratio.y);

            if (layer.type === 'text' || layer.type === 'scrolling-text') {
                const scaleX = layer.scale != null ? layer.scale[0] : 0.8;

                layerMesh = this._createTextLayer(layer.text, layer.font, layer.fontSize, layer.color, layer.opacity,
                    renderOrder++, scaleX);
                if (layer.textAlign === 'center') {
                    position.setX(position.x - layerMesh.size.x / 2)
                } else if (layer.textAlign === 'right') {
                    position.setX(position.x + size.x / 2 - layerMesh.size.x);
                }
                layerMesh.position.copy(position);

                if (layer.type === 'scrolling-text') {
                    const boundaries = new THREE.Vector2(
                        this._position.x + layer.boundaries[0] / this._ratio.x,
                        this._position.x + layer.boundaries[1] / this._ratio.x
                    );
                    this._scrollingText = new ScrollingText(layerMesh, boundaries, size.x, 22000, 2000);
                }
            } else {
                const scaleY = layer.scale != null ? layer.scale[1] : null;

                const material = MATERIALS[layer.material];
                if (Array.isArray(material)) {
                    for (let m of material) {
                        const mesh = this._createLayer(m, size, position, scaleY);
                        mesh.rotation.set(0, 0, 0);
                        mesh.renderOrder = renderOrder++;
                        this.add(mesh);
                        this._materials.push(mesh.material);
                    }
                } else {
                    layerMesh = this._createLayer(material, size, position, scaleY);
                    layerMesh.rotation.set(0, 0, 0);
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

            offset.add(offsetStep);
        }

        this.rotation.copy(this._rotation);
        this.position.copy(this._position);
    }

    update(time) {
        super.update(time);
        if (this._scrollingText) {
            this._scrollingText.update(time);
        }
    }

    _getScreenWidth() {
        return HEALTH_STATION_GUI.width;
    }

    _getScreenHeight() {
        return HEALTH_STATION_GUI.height;
    }

    _computeRotation(position, quaternion, normal) {
        const rotation = super._computeRotation(position, quaternion, normal);
        rotation.z += THREE.Math.degToRad(-90);
        return rotation;
    }
}
