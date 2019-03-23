export const MODELS = {
    'models/mapobjects/elevators/elevator.lwo': {
        lights: [
            {type: 'point', color: 0xffffff, distance: 120, position: [0, -65, -88]},
            {type: 'point', color: 0xffffff, distance: 100, position: [0, -65, -44]},
            {type: 'point', color: 0xffffff, distance: 30, position: [0, -65, -125]}
        ],
        cm: {
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
        }
    },
    'models/mapobjects/elevators/elevator_door.lwo': {
        cm: {
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
        }
    },
    'models/mapobjects/doors/delelev/delelevlf.lwo': {
        cm: {
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
        }
    },
    'models/mapobjects/doors/delelev/delelevrt.lwo': {
        cm: {
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
        }
    }
};