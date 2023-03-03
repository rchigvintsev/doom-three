import {Container} from 'inversify';
import 'reflect-metadata';

import {GameAssets} from './game-assets';
import {GameConfig} from './game-config';
import {TYPES} from './types';
import {GameManager} from './game-manager';
import {TweenAnimationManager} from './animation/tween-animation-manager';
import {PointerLock} from './control/pointer-lock';
import {Game} from './game';
import {CannonPhysicsManager} from './physics/cannon-physics-manager';
import {isPhysicsManager, PhysicsManager} from './physics/physics-manager';

export function configureDiContainer(pointerLock: PointerLock,
                                     config: GameConfig,
                                     assets: GameAssets): Container {
    const container = new Container({skipBaseClassChecks: true, defaultScope: 'Singleton'});

    container.bind<PointerLock>(TYPES.PointerLock).toConstantValue(pointerLock);
    container.bind<GameConfig>(TYPES.Config).toConstantValue(config);
    container.bind<GameAssets>(TYPES.Assets).toConstantValue(assets);

    container.bind<GameManager>(TYPES.GameManager).to(TweenAnimationManager);
    container.bind<GameManager>(TYPES.GameManager).to(CannonPhysicsManager);
    container.bind<PhysicsManager>(TYPES.PhysicsManager).toDynamicValue(context => {
        const gameManagers = context.container.getAll<GameManager>(TYPES.GameManager);
        for (const manager of gameManagers) {
            if (isPhysicsManager(manager)) {
                return manager;
            }
        }
        throw new Error('Physics manager is not found in DI container');
    }).whenTargetNamed("physics");
    container.bind<Game>(TYPES.Game).to(Game);

    return container;
}
