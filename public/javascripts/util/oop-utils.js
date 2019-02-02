var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.inherit = function (parent, members) {
        var child = Object.create(parent.prototype);

        Object.getOwnPropertyNames(members).forEach(function (prop) {
            var propDesc = Object.getOwnPropertyDescriptor(members, prop);

            if (propDesc.get !== undefined)
                child.__defineGetter__(prop, propDesc.get);
            else
                child[prop] = members[prop];

            if (propDesc.set !== undefined)
                child.__defineSetter__(prop, propDesc.set);
        });

        return child;
    };
})(DOOM_THREE);

export const inherit = DOOM_THREE.inherit;
