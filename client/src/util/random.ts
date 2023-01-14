/**
 * Based on the answer found on StackOverflow (https://stackoverflow.com/a/47593316/2623021).
 */
export class Random {
    private readonly seed: number[];

    constructor(seed?: number[]) {
        if (seed == undefined) {
            seed = this.cyrb128();
        }
        this.seed = seed;
    }

    sfc32(): number {
        let a = this.seed[0];
        let b = this.seed[1];
        let c = this.seed[2];
        let d = this.seed[3];

        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;

        let t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;

        this.seed[0] = a;
        this.seed[1] = b;
        this.seed[2] = c;
        this.seed[3] = d;

        return (t >>> 0) / 4294967296;
    }

    private cyrb128(str = 'doom') {
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
    }
}
