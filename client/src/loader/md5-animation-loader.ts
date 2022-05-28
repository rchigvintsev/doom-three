import {FileLoader, Loader, LoadingManager, Quaternion, Vector3} from 'three';

/**
 * Code for parsing of MD5 animation is kindly borrowed from "MD5 to JSON Converter"
 * (http://oos.moxiecode.com/js_webgl/md5_converter) by @oosmoxiecode (https://twitter.com/oosmoxiecode).
 */
export class Md5AnimationLoader extends Loader {
    private readonly fileLoader: FileLoader;

    constructor(manager?: LoadingManager) {
        super(manager);
        this.fileLoader = new FileLoader(manager);
    }

    loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<any> {
        return this.fileLoader.loadAsync(url, onProgress).then(content => this.parse(<string>content));
    }

    parse(s: string): any {
        const name = this.parseName(s);
        const frameRate = this.parseFrameRate(s);
        const hierarchy = this.parseHierarchy(s);
        const baseFrames = this.parseBaseFrames(s);
        const frames = this.parseFrames(s);
        return {name, frameRate, frameTime: 1000 / frameRate, hierarchy, baseFrames, frames};
    }

    private parseName(s: string): string {
        let result = 'default';
        s.replace(/\/(\w+)\.md5anim/, (_, animationName) => {
            result = animationName;
            return _;
        });
        return result;
    }

    private parseFrameRate(s: string): number {
        let result = 24;
        s.replace(/frameRate (\d+)/, (_, frameRate) => {
            result = parseInt(frameRate);
            return _;
        });
        return result;
    }

    private parseHierarchy(s: string): any[] {
        const result: any[] = [];
        s.replace(/hierarchy {([^}]*)}/m, (_, hierarchy) => {
            (<string>hierarchy).replace(/"(.+)"\s([-\d]+) (\d+) (\d+)/g, (_, name, parent, flags, index) => {
                result.push({name, parent: parseInt(parent), flags: parseInt(flags), index: parseInt(index)});
                return _;
            });
            return _;
        });
        return result;
    }

    private parseBaseFrames(s: string): any[] {
        const result: any[] = [];
        s.replace(/baseframe {([^}]*)}/m, (_, baseFrames) => {
            const baseFrameRegExp = /\( ([-\d.]+) ([-\d.]+) ([-\d.]+) \) \( ([-\d.]+) ([-\d.]+) ([-\d.]+) \)/g;
            (<string>baseFrames).replace(baseFrameRegExp, (_, x, y, z, ox, oy, oz) => {
                const position = new Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
                const orientation = new Quaternion(parseFloat(ox), parseFloat(oy), parseFloat(oz), 0);
                result.push({position, orientation});
                return _;
            });
            return _;
        });
        return result;
    }

    private parseFrames(s: string): number[][] {
        const result: number[][] = [];
        s.replace(/frame \d+ {([^}]*)}/mg, (_, frames) => {
            const frame: number[] = [];
            (<string>frames).replace(/([-\d.]+)/g, (_, value) => {
                frame.push(parseFloat(value));
                return _;
            });
            result.push(frame);
            return _;
        });
        return result;
    }
}