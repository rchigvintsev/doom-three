var DOOM_THREE = DOOM_THREE || {};

(function (DT) {
    DT.Groups = DT.Groups || {};
    DT.Groups.Site3 = [];

    var group = new DT.Group('group_1', ['func_static_4911', 'sprite_1']);
    group.position.set(-2272.0, -833.5, 2328.0);
    group.position.multiplyScalar(DT.GameConstants.WORLD_SCALE);
    group.rotation.y = THREE.Math.degToRad(-90);
    DT.Groups.Site3.push(group);


    group = new DT.Group('group_2', ['func_static_4908', 'sprite_4']);
    group.position.set(-1840.0, -816.0, 2216.0);
    group.position.multiplyScalar(DT.GameConstants.WORLD_SCALE);
    group.rotation.y = THREE.Math.degToRad(15);
    DT.Groups.Site3.push(group);

    group = new DT.Group('group_3', ['func_static_4909', 'sprite_2']);
    group.position.set(-1984.0, -816.0, 2232.0);
    group.position.multiplyScalar(DT.GameConstants.WORLD_SCALE);
    group.rotation.y = THREE.Math.degToRad(45);
    DT.Groups.Site3.push(group);


    group = new DT.Group('group_4', ['func_static_4910', 'sprite_5']);
    group.position.set(-2224.0, -816.0, 2053.0);
    group.position.multiplyScalar(DT.GameConstants.WORLD_SCALE);
    group.rotation.y = THREE.Math.degToRad(-35);
    DT.Groups.Site3.push(group);

    group = new DT.Group('group_5', ['func_static_4912', 'sprite_3']);
    group.position.set(-1904.0, -816.0, 2576.0);
    group.position.multiplyScalar(DT.GameConstants.WORLD_SCALE);
    group.rotation.y = THREE.Math.degToRad(-67.5);
    DT.Groups.Site3.push(group);
})(DOOM_THREE);
