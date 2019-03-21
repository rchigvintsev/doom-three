import {GuiMaterialBuilder} from '../../map/material/gui-material-builder.js';
import {Malfunction2Gui} from '../../map/gui/malfunction2-gui.js';
import {EnterSite3Gui} from '../../map/gui/enter-site3-gui.js';
import {MeshFactory} from '../mesh-factory.js';

export class GuiFactory extends MeshFactory {
    constructor(assets) {
        super(assets, new GuiMaterialBuilder(assets));
    }

    create(entityDef, parentGeometry, index) {
        if (entityDef.guiClass === 'malfunction2')
            return new Malfunction2Gui(parentGeometry, index, this._materialBuilder);
        if (entityDef.guiClass === 'enter_site3')
            return new EnterSite3Gui(parentGeometry, index, this._materialBuilder);
        throw 'Unsupported GUI class: ' + entityDef.guiClass;
    }
}
