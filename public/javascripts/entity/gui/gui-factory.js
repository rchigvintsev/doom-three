import {GuiMaterialBuilder} from '../../map/material/gui-material-builder.js';
import {Malfunction2Gui} from './malfunction2-gui.js';
import {EnterSite3Gui} from './enter-site3-gui.js';
import {MeshFactory} from '../mesh-factory.js';

export class GuiFactory extends MeshFactory {
    constructor(assetLoader) {
        super(assetLoader, new GuiMaterialBuilder(assetLoader));
    }

    create(guiDef, parentGeometry) {
        if (guiDef.name === 'guis/screens/malfunction2.gui')
            return new Malfunction2Gui(parentGeometry, guiDef.index, this._materialBuilder);
        if (guiDef.name === 'guis/transfer/enter_site3.gui')
            return new EnterSite3Gui(parentGeometry, guiDef.index, this._materialBuilder);
        console.error('Unsupported GUI: ' + guiDef.name);
        return null;
    }
}
