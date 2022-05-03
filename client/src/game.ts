import * as THREE from 'three';
import Stats from "three/examples/jsm/libs/stats.module";

export class Game {
    private static frustumSize = 600;

    private static SCREEN_WIDTH = window.innerWidth;
    private static SCREEN_HEIGHT = window.innerHeight;
    private static aspect = Game.SCREEN_WIDTH / Game.SCREEN_HEIGHT;

    private container: HTMLElement;
    private stats: Stats;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private mesh: THREE.Mesh;
    private cameraRig: THREE.Group;
    private activeCamera: THREE.Camera;
    private activeHelper: THREE.CameraHelper;
    private cameraPerspective: THREE.PerspectiveCamera;
    private cameraOrtho: THREE.OrthographicCamera;
    private cameraPerspectiveHelper: THREE.CameraHelper;
    private cameraOrthoHelper: THREE.CameraHelper;

    constructor() {
        this.container = document.createElement( 'div' );
        document.body.appendChild( this.container );

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 50, 0.5 * Game.aspect, 1, 10000 );
        this.camera.position.z = 2500;

        this.cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * Game.aspect, 150, 1000 );

        this.cameraPerspectiveHelper = new THREE.CameraHelper( this.cameraPerspective );
        this.scene.add( this.cameraPerspectiveHelper );

        //
        this.cameraOrtho = new THREE.OrthographicCamera( 0.5 * Game.frustumSize * Game.aspect / - 2, 0.5 * Game.frustumSize * Game.aspect / 2, Game.frustumSize / 2, Game.frustumSize / - 2, 150, 1000 );

        this.cameraOrthoHelper = new THREE.CameraHelper( this.cameraOrtho );
        this.scene.add( this.cameraOrthoHelper );

        //

        this.activeCamera = this.cameraPerspective;
        this.activeHelper = this.cameraPerspectiveHelper;


        // counteract different front orientation of cameras vs rig

        this.cameraOrtho.rotation.y = Math.PI;
        this.cameraPerspective.rotation.y = Math.PI;

        this.cameraRig = new THREE.Group();

        this.cameraRig.add( this.cameraPerspective );
        this.cameraRig.add( this.cameraOrtho );

        this.scene.add( this.cameraRig );

        //

        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry( 100, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
        );
        this.scene.add( this.mesh );

        const mesh2 = new THREE.Mesh(
            new THREE.SphereGeometry( 50, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
        );
        mesh2.position.y = 150;
        this.mesh.add( mesh2 );

        const mesh3 = new THREE.Mesh(
            new THREE.SphereGeometry( 5, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
        );
        mesh3.position.z = 150;
        this.cameraRig.add( mesh3 );

        //

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for ( let i = 0; i < 10000; i ++ ) {

            vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
            vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
            vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z

        }

        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

        const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
        this.scene.add( particles );

        //

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( Game.SCREEN_WIDTH, Game.SCREEN_HEIGHT );
        this.container.appendChild( this.renderer.domElement );

        this.renderer.autoClear = false;

        //

        this.stats = Stats();
        this.container.appendChild( this.stats.dom );

        //

        window.addEventListener( 'resize', () => this.onWindowResize() );
        document.addEventListener( 'keydown', (event) => this.onKeyDown(event) );

    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.render();
        this.stats.update();
    }

    private render() {
        const r = Date.now() * 0.0005;

        this.mesh.position.x = 700 * Math.cos( r );
        this.mesh.position.z = 700 * Math.sin( r );
        this.mesh.position.y = 700 * Math.sin( r );

        this.mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
        this.mesh.children[ 0 ].position.z = 70 * Math.sin( r );

        if ( this.activeCamera === this.cameraPerspective ) {

            this.cameraPerspective.fov = 35 + 30 * Math.sin( 0.5 * r );
            this.cameraPerspective.far = this.mesh.position.length();
            this.cameraPerspective.updateProjectionMatrix();

            this.cameraPerspectiveHelper.update();
            this.cameraPerspectiveHelper.visible = true;

            this.cameraOrthoHelper.visible = false;

        } else {

            this.cameraOrtho.far = this.mesh.position.length();
            this.cameraOrtho.updateProjectionMatrix();

            this.cameraOrthoHelper.update();
            this.cameraOrthoHelper.visible = true;

            this.cameraPerspectiveHelper.visible = false;

        }

        this.cameraRig.lookAt( this.mesh.position );

        this.renderer.clear();

        this.activeHelper.visible = false;

        this.renderer.setViewport( 0, 0, Game.SCREEN_WIDTH / 2, Game.SCREEN_HEIGHT );
        this.renderer.render( this.scene, this.activeCamera );

        this.activeHelper.visible = true;

        this.renderer.setViewport( Game.SCREEN_WIDTH / 2, 0, Game.SCREEN_WIDTH / 2, Game.SCREEN_HEIGHT );
        this.renderer.render( this.scene, this.camera );
    }

    private onKeyDown( event: KeyboardEvent ) {
        switch ( event.keyCode ) {

            case 79: /*O*/

                this.activeCamera = this.cameraOrtho;
                this.activeHelper = this.cameraOrthoHelper;

                break;

            case 80: /*P*/

                this.activeCamera = this.cameraPerspective;
                this.activeHelper = this.cameraPerspectiveHelper;

                break;
        }
    }

    private onWindowResize() {
        Game.SCREEN_WIDTH = window.innerWidth;
        Game.SCREEN_HEIGHT = window.innerHeight;
        Game.aspect = Game.SCREEN_WIDTH / Game.SCREEN_HEIGHT;

        this.renderer.setSize( Game.SCREEN_WIDTH, Game.SCREEN_HEIGHT );

        this.camera.aspect = 0.5 * Game.aspect;
        this.camera.updateProjectionMatrix();

        this.cameraPerspective.aspect = 0.5 * Game.aspect;
        this.cameraPerspective.updateProjectionMatrix();

        this.cameraOrtho.left = - 0.5 * Game.frustumSize * Game.aspect / 2;
        this.cameraOrtho.right = 0.5 * Game.frustumSize * Game.aspect / 2;
        this.cameraOrtho.top = Game.frustumSize / 2;
        this.cameraOrtho.bottom = - Game.frustumSize / 2;
        this.cameraOrtho.updateProjectionMatrix();
    }
}
