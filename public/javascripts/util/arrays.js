export class Arrays {
    static copy(src, dst) {
        for (let i = 0; i < src.length; i++) {
            dst[i] = src[i];
        }
    }
}
