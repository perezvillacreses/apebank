import * as THREE from '../../build/three.module.js';
import { GLTFLoader } from "../../jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "../../jsm/postprocessing/EffectComposer.js";
import { RenderPass } from '../../jsm/postprocessing/RenderPass.js';
import { GlitchPass } from '../../jsm/postprocessing/GlitchPass.js';
import { FilmPass } from '../../jsm/postprocessing/FilmPass.js';
import { UnrealBloomPass } from '../../jsm/postprocessing/UnrealBloomPass.js';
import { BokehShader, BokehDepthShader } from '../../jsm/shaders/BokehShader2.js';
import { GUI } from '../../jsm/libs/lil-gui.module.min.js';

//import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import Stats from '../../jsm/libs/stats.module.js';


let textureEquirec;
let stats, camera, renderer, scene, composer, renderPass, filmPass, bloomPass, glitchPass, coin;
//models
let mainScene;
//Parametros gui
const postprocessing = { enabled: true };
const Method = {
	INSTANCED: 'INSTANCED',
	MERGED: 'MERGED',
	NAIVE: 'NAIVE'
};

const api = {
	method: Method.INSTANCED,
	count: 1000
};

// Canvas
const canvas = document.querySelector('canvas.webgl')
//const gui= new dat.gui();
    let options={morph:0};

const textureLoader = new THREE.TextureLoader();

textureEquirec = textureLoader.load( './assets/3d/hdri.jpg', function(texture){
	texture.encoding = THREE.sRGBEncoding;
	texture.mapping = THREE.EquirectangularReflectionMapping;
	init( texture );
	animate();
} );



stats = new Stats();
stats.showPanel( 0 );
//document.body.appendChild( stats.dom );

//3D models
const loader = new GLTFLoader().setPath('./assets/3d/');

//init
function init( texture ){
	
	//camera
	camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 0.1, 40 );
	camera.position.set(0, 0, 5);
	camera.lookAt( 0, 0, 0.2 );
	
	/**
 	*Sizes*/
	 const sizes = {
		width: window.innerWidth,
		height: window.innerHeight
	}	
	
	//Renderer
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		antialias: true,
		alpha: true
	});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.powerPreference = "low-power";
	document.body.appendChild( renderer.domElement );


	scene = new THREE.Scene();
	//scene.background = new THREE.Color(0xe9eaeb, 0);
	scene.environment = textureEquirec;
	
	scene.background = ( 0x000000, 0 );
	renderer.setClearColor( 0x000000, 0 );
	//scene.environment = cubeCamera.renderTarget.texture;
	//scene.fog = new THREE.FogExp2( 0xB5B5B5, 0.01 );


	///postprocess
	var width = window.innerWidth || 1;
var height = window.innerHeight || 1;
	var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
	var renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

	const params = {
		exposure: 1,
		bloomStrength: 1.5,
		bloomThreshold: 0,
		bloomRadius: 1
	};
	const bloomPass = new UnrealBloomPass( 
		new THREE.Vector2( window.innerWidth, window.innerHeight ), 
		1.5, 
		0.4, 
		0.85 
	);
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;


//gui.add( effectController, 'noise' ).onChange( matChanger );
composer = new EffectComposer( renderer, renderTarget );
renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
/*	filmPass = new FilmPass(
		0.35,   // noise intensity
		0.025,  // scanline intensity
		648,    // scanline count
		false,  // grayscale
	);*/
	
	filmPass = new FilmPass(
		1,   // noise intensity
		0.5,  // scanline intensity
		540,    // scanline count
		false,  // grayscale
	);
	filmPass.renderToScreen = true;
	glitchPass = new GlitchPass(
		5 //dt_size
	);
	//composer.addPass( glitchPass );
	composer.addPass(filmPass);
	//composer.addPass( bloomPass );
	function resizeRendererToDisplaySize(renderer) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if (needResize) {
		  renderer.setSize(width, height, false);
		}
		return needResize;
	  }


	window.addEventListener('resize', () =>
	{
		// Update sizes
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;


		// Update camera
		camera.aspect = sizes.width / sizes.height
		camera.updateProjectionMatrix();

		// Update renderer
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	});

	// Normal textures coin
	const text_coin_normal1 = new THREE.TextureLoader().load('./assets/3d/NormalMapHands.jpg',
	 () => {
		 text_coin_normal1.flipY = false;
	 });

	 const text_coin_normal2 = new THREE.TextureLoader().load('./assets/3d/NormalMap2.png',
	 () => {
		 text_coin_normal2.flipY = false;
	 });
	 const text_coin_ao2 = new THREE.TextureLoader().load('./assets/3d/AmbientOcclusionMap (2).png',
	 () => {
		 text_coin_ao2.flipY = false;
	 });
	 //emissive map coin
	 const text_coin_emissive = new THREE.TextureLoader().load('./assets/3d/emissiveMap.jpg',
	 () => {
		text_coin_emissive.flipY = false;
	 });
	 


	 const text_coin_normal3 = new THREE.TextureLoader().load('./assets/3d/NormalMap3.png',
	 () => {
		 text_coin_normal3.flipY = false;
	 });
	 // material coin
	const coinMaterial = new THREE.MeshStandardMaterial({
		color: new THREE.Color(0xDCDCDC),
		normalMap: text_coin_normal2,
		aoMap: text_coin_ao2,
		emissiveMap: text_coin_emissive,
		emissive: new THREE.Color(0xfb0000),
		emissiveIntensity: 10,
	});

	//3D models
	
	loader.load( 'scene.glb', function ( gltf ) {
		//model = gltf.scene;
		//document.querySelector('.loader').classList.add('loader-fade');		
		mainScene = gltf.scene
		console.log(mainScene)
		mainScene.traverse((o) => {
			if (o.isMesh) o.material = coinMaterial;
		  });
		//mainScene.morphTargetInfluences[ 1 ] = 0;
		//mainScene.computeMorphNormals();
		//mainScene.castShadow = true;
		
		scene.add( mainScene );
		createGUI(mainScene, gltf.animations)
		
		  //gui.add(options,'morph',0,1).onChange(morphChange);
		
	}, 
	(xhr) => {
        console.log(Math.floor((xhr.loaded / xhr.total) * 100) + '% loaded');
		//document.getElementById('load-percent').innerText = Math.floor((xhr.loaded / xhr.total) * 100) + '% Loading...';
    },
	undefined, function ( error ) {
		console.error( error );
	} );
	//scene.add( ambientLight );
	//scene.add( hemiLight );
	//scene.add( dirLight );
	const geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const cube = new THREE.Mesh( geometry, material );
	cube.position.set(0, 0.04,0.8)
	//scene.add( cube );
}

function createGUI( model, animations ) {
	const gui = new GUI();
	//coin = model.getObjectByName( 'coin_octagono.broken' );
	coin = model.children[0];
	const expressions = Object.keys( model.children[0].morphTargetDictionary );
	const expressionFolder = gui.addFolder( 'Expressions' );

	for ( let i = 0; i < expressions.length; i ++ ) {

		expressionFolder.add( model.children[0].morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );

	}

	///activeAction = actions[ 'Walking' ];
	//activeAction.play();

	expressionFolder.open();
}

//lights 
const dirLight = new THREE.DirectionalLight( 0xFFE6C1 );
dirLight.position.set( 60, 60, -60 );
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 128; // default
dirLight.shadow.mapSize.height = 128; // default
dirLight.shadow.camera.near = 0.5; // default
dirLight.shadow.camera.far = 500; 

//
const ambientLight = new THREE.AmbientLight( 0x13131e );
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);

	
 
function lerp(x, y, a) {
    return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts = []


animationScripts.push({
    start: 0,
    end: 20,
    func: () => {
		camera.lookAt(0,0,0)
		//mainScene.position.x = lerp(0,3, scalePercent(0,20));
		mainScene.position.z = lerp(0,-10, scalePercent(0, 20));
		mainScene.children[0.].morphTargetInfluences[0] = lerp(0,1, scalePercent(0, 20));
		//expressionFolder.add( model.children[0].morphTargetInfluences, i, 0, 1, 0.01 ).name( expressions[ i ] );
    },
})
animationScripts.push({
    start: 20,
    end: 40,
    func: () => {
		//mainScene.position.x = lerp(10,10, scalePercent(21,40));
		mainScene.position.z = lerp(-10,-10, scalePercent(21, 40));
		
    },
})

animationScripts.push({
    start: 40,
    end: 60,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(41, 60));
		mainScene.position.z = lerp(1,1, scalePercent(41, 60));
    },
})
animationScripts.push({
    start: 60,
    end: 80,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(60, 80));
		mainScene.position.z = lerp(1,1, scalePercent(60, 80));
    },
})
animationScripts.push({
    start: 80,
    end: 101,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(80, 100));
		mainScene.position.z = lerp(1,1, scalePercent(80, 100));
    },
})

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent = (
		(document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight)	) * 100;
	document.getElementById('scrollProgress').innerText =
        'Scroll Progress : ' + scrollPercent.toFixed(2) + ' X rotation : ' + mainScene.rotation.x
}

document.addEventListener('mousemove', onDocumentMouseMove);

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowX = window.innerWidth / 2;
const windowY = window.innerHeight / 2;
function onDocumentMouseMove(event){
	mouseX = (event.clientX - windowX);
	mouseY = (event.clientY - windowY);
}
const clock = new THREE.Clock();
const tick = () =>{
	targetX = mouseX * 0.001;
	targetY = mouseY * 0.001;
	const elapsedTime = clock.getElapsedTime();
	mainScene.rotation.y = elapsedTime;
	mainScene.rotation.y += 0.5 * (targetX - mainScene.rotation.y)
	mainScene.rotation.x += 0.5 * (targetY - mainScene.rotation.x)
	//mainScene.rotation.z += 0.001 * (targetX - mainScene.rotation.y)
}







function animate() {
	
	requestAnimationFrame(animate);
	playScrollAnimations()
	tick();
	//render();
	/*if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
		composer.setSize(canvas.width, canvas.height);
	  }*/
	composer.render();
	stats.end();
	
}


function render(){
	renderer.render(scene, camera);	
}
window.scrollTo({ top: 0, behavior: 'smooth' })