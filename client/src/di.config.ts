import {Container} from 'inversify';
import 'reflect-metadata';

import {GameAssets} from './game-assets';
import {GameConfig} from './game-config';
import {TYPES} from './types';

export function createDiContainer(config: GameConfig, assets: GameAssets): Container {
    const container = new Container();
    container.bind<GameConfig>(TYPES.Config).toConstantValue(config);
    container.bind<GameAssets>(TYPES.Assets).toConstantValue(assets);
    return container;
}
