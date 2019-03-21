// TODO: Is it a right way of using AudioListener?
let listener;
export class AudioListener {
    static getListener() {
        if (!listener)
            listener = new THREE.AudioListener();
        return listener;
    }
}