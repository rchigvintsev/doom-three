export const TABLES = {
    pdStarTable: {snap: false, values: [0.70, 0.40, 1.00, 0.05, 0.50, 0.20, 1.00, 0.20, 0.80, 0.10, 0.40, 0.20]},
    pdhalffade: {snap: false, values: [.3, .2]},
    pdhalffade2: {snap: false, values: [.5, 1.0]},
    pdfullfade: {snap: false, values: [1.0, 0.3]},
    pdscaleTable2: {snap: false, values: [2, 3, .5, 1]},
    pdcomm2Table: {snap: false, values: [0, 0.7, 0, 0, 0, 0, 0.2, 0, 0, 0, 0, 0.7, 0, 0, 0, 0.2, 0, 0]},
    pdscaleTable4: {snap: false, values: [1, .5]},
    staticatable: {snap: true, values: [1, -1, 1, -1]},
    flickertable: {snap: false, values: [1, .75]},
    pdflick: {snap: false, values: [1, .85]},
    subtleflick: {snap: false, values: [1, .92]},
};

export class Tables {
    static getTableValue(tableName, value) {
        const table = TABLES[tableName];
        const val = value % table.values.length;
        if (!table.snap) {
            let floor = Math.floor(val);
            let ceil = Math.ceil(val);
            if (ceil >= table.values.length) {
                ceil = 0;
            }
            const floorVal = table.values[floor];
            const ceilVal = table.values[ceil];
            return floorVal + (val - floor) * 100 * ((ceilVal - floorVal) / 100);
        }
        return table.values[Math.floor(val)];
    }
}
