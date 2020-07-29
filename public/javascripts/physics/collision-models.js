export const COLLISION_MODELS = {
    'models/mapobjects/elevators/elevator.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'floor',
                shapes: [
                    {
                        type: 'box',
                        width: 125,
                        height: 135,
                        depth: 10,
                        offset: [0, -67.5, 5]
                    }
                ]
            },
            {
                mass: 0,
                material: 'default',
                shapes: [
                    { // Ceiling
                        type: 'box',
                        width: 125,
                        height: 135,
                        depth: 10,
                        offset: [0, -67.5, -155]
                    },
                    { // Rear wall
                        type: 'box',
                        width: 125,
                        height: 150,
                        depth: 10,
                        offset: [0, -130, -75],
                        rotation: [90, 0, 0]
                    },
                    { // Left wall
                        type: 'box',
                        width: 121,
                        height: 150,
                        depth: 10,
                        offset: [57.5, -64.5, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Right wall
                        type: 'box',
                        width: 121,
                        height: 150,
                        depth: 10,
                        offset: [-57.5, -64.5, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Left front wall
                        type: 'box',
                        width: 10,
                        height: 150,
                        depth: 13,
                        offset: [46, -9, -75],
                        rotation: [90, 90, 0]
                    },
                    { // Right front wall
                        type: 'box',
                        width: 10,
                        height: 150,
                        depth: 13,
                        offset: [-46, -9, -75],
                        rotation: [90, 90, 0]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/elevators/elevator_door.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 40,
                        height: 10,
                        depth: 128,
                        offset: [-20, -2, -64]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/doors/delelev/delelevlf.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 64,
                        height: 10,
                        depth: 128,
                        offset: [-32, -1, -64]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/doors/delelev/delelevrt.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 64,
                        height: 10,
                        depth: 128,
                        offset: [32, -1, -64]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/guiobjects/techdrpanel1/techdrpanel1.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 26,
                        height: 10,
                        depth: 23,
                        offset: [-0.5, -3.5, 0]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/healthgui/healthgui.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'default',
                shapes: [
                    {
                        type: 'box',
                        width: 32,
                        height: 21,
                        depth: 54,
                        offset: [0, 11, 3]
                    }
                ]
            }
        ]
    },
    'models/mapobjects/hell/site3/entrance/HellknightHole.lwo': {
        bodies: [
            {
                mass: 0,
                material: 'floor',
                shapes: [
                    {
                        type: 'heightfield',
                        elementSize: 0.142,
                        matrix: [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, -0.1, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.1, 0],
                            [0, -0.1, -0.15, -0.15, -0.09, -0.09, -0.15, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.13, -0.13, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.17, -0.17, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.21, -0.21, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.25, -0.25, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.25, -0.25, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.21, -0.21, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.17, -0.17, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.2, -0.13, -0.13, -0.2, -0.15, -0.1, 0],
                            [0, -0.1, -0.15, -0.15, -0.09, -0.09, -0.15, -0.15, -0.1, 0],
                            [0, -0.1, -0.1, -0.1, -0.05, -0.05, -0.1, -0.1, -0.1, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ],
                        offset: [-60, 128, -6.3],
                        rotation: [180, 0, 0]
                    }
                ]
            }
        ]
    }
};
