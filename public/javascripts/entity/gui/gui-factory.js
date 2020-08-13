import {GuiMaterialFactory} from '../../material/factory/gui-material-factory.js';
import {Malfunction2Gui} from './malfunction2-gui.js';
import {EnterSite3Gui} from './enter-site3-gui.js';
import {MeshFactory} from '../mesh-factory.js';
import {HealthStationGui} from './health-station-gui.js';
import {PdaDoorTriggerGui} from "./pda-door-trigger-gui.js";

export class GuiFactory extends MeshFactory {
    constructor(assetLoader) {
        super(assetLoader, new GuiMaterialFactory(assetLoader));
    }

    create(guiDef, parent) {
        if (guiDef.name === 'guis/screens/malfunction2.gui') {
            return new Malfunction2Gui(parent, guiDef.index, this._materialBuilder);
        }
        if (guiDef.name === 'guis/transfer/enter_site3.gui') {
            return new EnterSite3Gui(parent, guiDef.index, this._materialBuilder);
        }
        if (guiDef.name === 'guis/controlpanels/healthstation.gui') {
            return new HealthStationGui(parent, guiDef.index, this._materialBuilder);
        }
        if (guiDef.name === 'guis/doors/pda_door_trigger.gui') {
            return new PdaDoorTriggerGui(parent, guiDef.index, this._materialBuilder);
        }
        console.error('Unsupported GUI: ' + guiDef.name);
        return null;
    }
}
