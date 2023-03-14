import {AudioListener, Scene} from 'three';

import {Container} from 'inversify';
import 'reflect-metadata';

import {GameAssets} from './game-assets';
import {GameConfig} from './game-config';
import {TYPES} from './types';
import {GameManager} from './game-manager';
import {TweenAnimationManager} from './animation/tween-animation-manager';
import {PointerLock} from './control/pointer-lock';
import {Game} from './game';
import {CannonPhysicsManager} from './physics/cannon/cannon-physics-manager';
import {PhysicsManager} from './physics/physics-manager';
import {DebrisManager} from './entity/model/lwo/debris-manager';
import {DebrisFactory} from './entity/model/lwo/debris-factory';
import {MaterialFactory} from './material/material-factory';
import {SoundFactory} from './entity/sound/sound-factory';
import {CollisionModelFactory} from './physics/collision-model-factory';
import {WeaponFactory} from './entity/model/md5/weapon/weapon-factory';
import {MonsterFactory} from './entity/model/md5/monster/monster-factory';
import {ParticleFactory} from './entity/particle/particle-factory';
import {DecalFactory} from './entity/decal/decal-factory';
import {AreaFactory} from './entity/area/area-factory';
import {SurfaceFactory} from './entity/surface/surface-factory';
import {LightFactory} from './entity/light/light-factory';
import {GameMapFactory} from './entity/map/game-map-factory';
import {PlayerFactory} from './entity/player/player-factory';
import {HudFactory} from './entity/hud/hud-factory';
import {SpriteTextFactory} from './entity/text/sprite-text-factory';
import {ParticleManager} from './entity/particle/particle-manager';
import {GameLoader} from './game-loader';
import {DecalManager} from './entity/decal/decal-manager';
import {CannonCollisionModelFactory} from './physics/cannon/cannon-collision-model-factory';

export function configureDiContainer(pointerLock: PointerLock, config: GameConfig, assets: GameAssets): Container {
    const container = new Container({skipBaseClassChecks: true, defaultScope: 'Singleton'});

    container.bind<PointerLock>(TYPES.PointerLock).toConstantValue(pointerLock);
    container.bind<GameConfig>(TYPES.Config).toConstantValue(config);
    container.bind<GameAssets>(TYPES.Assets).toConstantValue(assets);
    container.bind<Scene>(TYPES.Scene).toConstantValue(new Scene());
    container.bind<AudioListener>(TYPES.AudioListener).toConstantValue(new AudioListener());

    container.bind<CollisionModelFactory>(TYPES.CollisionModelFactory).to(CannonCollisionModelFactory);
    container.bind<MaterialFactory>(TYPES.MaterialFactory).to(MaterialFactory);
    container.bind<SpriteTextFactory>(TYPES.SpriteTextFactory).to(SpriteTextFactory);
    container.bind<LightFactory>(TYPES.LightFactory).to(LightFactory);
    container.bind<SurfaceFactory>(TYPES.SurfaceFactory).to(SurfaceFactory);
    container.bind<AreaFactory>(TYPES.AreaFactory).to(AreaFactory);
    container.bind<SoundFactory>(TYPES.SoundFactory).to(SoundFactory);
    container.bind<ParticleFactory>(TYPES.ParticleFactory).to(ParticleFactory);
    container.bind<DebrisFactory>(TYPES.DebrisFactory).to(DebrisFactory);
    container.bind<DecalFactory>(TYPES.DecalFactory).to(DecalFactory);
    container.bind<WeaponFactory>(TYPES.WeaponFactory).to(WeaponFactory);
    container.bind<MonsterFactory>(TYPES.MonsterFactory).to(MonsterFactory);
    container.bind<PlayerFactory>(TYPES.PlayerFactory).to(PlayerFactory);
    container.bind<HudFactory>(TYPES.HudFactory).to(HudFactory);
    container.bind<GameMapFactory>(TYPES.MapFactory).to(GameMapFactory);

    container.bind<PhysicsManager>(TYPES.PhysicsManager).to(CannonPhysicsManager);
    container.bind<ParticleManager>(TYPES.ParticleManager).to(ParticleManager);
    container.bind<DebrisManager>(TYPES.DebrisManager).to(DebrisManager);
    container.bind<DecalManager>(TYPES.DecalManager).to(DecalManager);

    container.bind<GameManager>(TYPES.GameManager).to(TweenAnimationManager);
    container.bind<GameManager>(TYPES.GameManager)
        .toDynamicValue(context => context.container.get<GameManager>(TYPES.PhysicsManager));
    container.bind<GameManager>(TYPES.GameManager)
        .toDynamicValue(context => context.container.get<ParticleManager>(TYPES.ParticleManager));
    container.bind<GameManager>(TYPES.GameManager)
        .toDynamicValue(context => context.container.get<DebrisManager>(TYPES.DebrisManager));
    container.bind<GameManager>(TYPES.GameManager)
        .toDynamicValue(context => context.container.get<DecalManager>(TYPES.DecalManager));

    container.bind<GameLoader>(TYPES.GameLoader).to(GameLoader);
    container.bind<Game>(TYPES.Game).to(Game);

    return container;
}
