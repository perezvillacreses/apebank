//import * as THREE from 'three';
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
//import { MathUtils } from 'three';
//import * as BufferGeometryUtils from '../../jsm/utils/BufferGeometryUtils.js';


let textureEquirec;
let camera, renderer, scene, composer, renderPass, filmPass, bloomPass, glitchPass, coin, backgroundCoins, mesh, bang;
//models
let mainScene;
//Parametros gui
const postprocessing = { enabled: true };
const Method = {
	INSTANCED: 'INSTANCED',
	MERGED: 'MERGED',
	NAIVE: 'NAIVE'
};
//bloom params
let params = {
	exposure: 1,
	bloomThreshold: 0,
	bloomStrength: 0.3, //1.2		
	bloomRadius: 0.5
};
// raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 );
document.addEventListener( 'mousemove', onPointerMove );
//unlock
var lock = Boolean(false);
var halfPiBool = Boolean(false)
	 //Array Textures
	 let coinMaterial;
	 let arr =[
		'./assets/3d/NormalMaphands.jpg',
		'./assets/3d/NormalMap2.png',
		'./assets/3d/NormalMap3.png',
		'./assets/3d/NormalMap4.png'
	]
	let textureToShow = 0;
	let arrtextureLoader = new THREE.TextureLoader();
	
	arrtextureLoader.load(arr[textureToShow], function(tex){
		arrtextureLoader.flipY = false
		coinMaterial.normalMap = tex;
		textureToShow++;
	});


const randomizeMatrix = function () {

	const position = new THREE.Vector3();
	const rotation = new THREE.Euler();
	const quaternion = new THREE.Quaternion();
	const scale = new THREE.Vector3();

	return function ( matrix ) {

		position.x = Math.random() * 40 - 20;
		position.y = Math.random() * 40 - 20;
		position.z = Math.random() * 40 - 20;

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;

		quaternion.setFromEuler( rotation );

		scale.x = scale.y = scale.z = Math.random() * 1;

		matrix.compose( position, quaternion, scale );

	};

}();

const api = {
	method: Method.INSTANCED,
	count: 1000
};
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl')

const textureLoader = new THREE.TextureLoader();

textureEquirec = textureLoader.load( './assets/3d/hdri.jpg', function(texture){
	texture.encoding = THREE.sRGBEncoding;
	texture.mapping = THREE.EquirectangularReflectionMapping;
	init( texture );
	animate();
} );

//3D models
const loader = new GLTFLoader().setPath('./assets/3d/');

//init
function init( texture ){	
	//camera
	camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 0.1, 40 );
	camera.position.set(-2, 0, 10);
	camera.lookAt(-2, 0, 0 );

	const cameraFolder = gui.addFolder('Camera')
	cameraFolder.add(camera.position, 'z', 0, 20).step(0.1)
	cameraFolder.add(camera.position, 'x', -2, 0).step(0.1)
	cameraFolder.open()
	
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
	var parameters = { 
		minFilter: THREE.LinearFilter, 
		magFilter: THREE.LinearFilter, 
		format: THREE.RGBAFormat, 
		stencilBuffer: false 
	};
	var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );
	
	const bloomPass = new UnrealBloomPass( 
		new THREE.Vector2( window.innerWidth, window.innerHeight ), 
		params.bloomStrength, 
		params.bloomRadius,
		params.bloomThreshold
	);
	bloomPass.exposure = params.exposure
	bloomPass.threshold = params.bloomThreshold;
	bloomPass.strength = params.bloomStrength;
	bloomPass.radius = params.bloomRadius;

	gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {
		renderer.toneMappingExposure = Math.pow( value, 4.0 );
	} );
	gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {
		bloomPass.threshold = Number( value );
	} );
	gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
		bloomPass.strength = Number( value );
	} );
	gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
		bloomPass.radius = Number( value );
	} );
	
composer = new EffectComposer( renderer, renderTarget );
renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );
	
	filmPass = new FilmPass(
		1,   // noise intensity 0.35
		0.25,  // scanline intensity 0.025
		540,    // scanline count 648
		false,  // grayscale false
	);
	filmPass.renderToScreen = true;
	glitchPass = new GlitchPass(
		5 //dt_size
	);

	
	//composer.addPass( glitchPass );
	composer.addPass(filmPass);
	composer.addPass( bloomPass );
	function resizeRendererToDisplaySize(renderer) {
		//const canvas = renderer.domElement;
		//const width = canvas.clientWidth;
		//const height = canvas.clientHeight;
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
		composer.setSize( sizes.width, sizes.height );
		
	});
	
	// Normal textures coin
	const text_coin_normal1 = new THREE.TextureLoader().load('./assets/3d/NormalMapHands.jpg',
	 () => {
		 //text_coin_normal1.flipY = false;
	 });

	 const text_coin_normal2 = new THREE.TextureLoader().load('./assets/3d/NormalMap2.png',
	 () => {
		 //text_coin_normal2.flipY = false;
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



// Click interaction
//var canvas = document.getElementsByTagName("canvas")[0];

canvas.addEventListener("click", function() {
	arrtextureLoader.load(arr[textureToShow], function(tex) {
		// Once the texture has loaded
		// Asign it to the material
		coinMaterial.normalMap = tex;
		// Update the next texture to show
		textureToShow++;
		// Have we got to the end of the textures array
		if(textureToShow > arr.length-1) {
		textureToShow = 0;
		}
 	}); 
});
//setInterval(changeTexture(),1000)
	 // material coin
	coinMaterial = new THREE.MeshStandardMaterial({
		//color: new THREE.Color(0xB8F0FF),
		normalMap: text_coin_normal1,
		aoMap: text_coin_ao2,
		//emissiveMap: text_coin_emissive,
		//emissive: new THREE.Color(0xfb0000),
		emissiveIntensity: 10,
		metalness: 1,
		roughness: 0.25
	});
	const minicoinMaterial = new THREE.MeshStandardMaterial({
		color: new THREE.Color(0x88C9FF),
		//normalMap: text_coin_normal2,
		//aoMap: text_coin_ao2,
		//emissiveMap: text_coin_emissive,
		emissive: new THREE.Color(0xfb0000),
		emissiveIntensity: 10,
		metalness: 1,
		roughness: 0.15
	});

	//3D models
		//Main coin break
	loader.load( 'scene.glb', function ( gltf ) {
		//model = gltf.scene;
		//document.querySelector('.loader').classList.add('loader-fade');		
		mainScene = gltf.scene
		mainScene.traverse((o) => {
			if (o.isMesh) o.material = coinMaterial;
		  });
		//mainScene.castShadow = true;
		scene.add( mainScene );
		createGUI(mainScene, gltf.animations)
		
	}, 
	(xhr) => {
        console.log(Math.floor((xhr.loaded / xhr.total) * 100) + '% loaded');
		//document.getElementById('load-percent').innerText = Math.floor((xhr.loaded / xhr.total) * 100) + '% Loading...';
    },
	undefined, function ( error ) {
		console.error( error );
	} );

	//Secondary coins
	loader.load( 'ApabankCoin.glb', function ( gltfcoin ) {	
		backgroundCoins = gltfcoin.scene
		backgroundCoins.scale.set(1,1,1)
		scene.add( backgroundCoins );		
	}, 
	(xhr) => {
        console.log(Math.floor((xhr.loaded / xhr.total) * 100) + '% loaded');
		//document.getElementById('load-percent').innerText = Math.floor((xhr.loaded / xhr.total) * 100) + '% Loading...';
    },
	undefined, function ( error ) {
		console.error( error );
	} );

	//Bang Shine
	loader.load( 'bang.glb', function ( gltfcoin ) {	
		bang = gltfcoin.scene		
		//scene.add( bang );
		
		  //gui.add(options,'morph',0,1).onChange(morphChange);
		
	}, 
	(xhr) => {
        console.log(Math.floor((xhr.loaded / xhr.total) * 100) + '% loaded');
		//document.getElementById('load-percent').innerText = Math.floor((xhr.loaded / xhr.total) * 100) + '% Loading...';
    },
	undefined, function ( error ) {
		console.error( error );
	} );

/////////////////////////////////////////////////////
	function makeInstanced( geometry ) {		
		const matrix = new THREE.Matrix4();
		mesh = new THREE.InstancedMesh( geometry, minicoinMaterial, api.count);
		for ( let i = 0; i < api.count; i ++ ) {
			randomizeMatrix( matrix );
			mesh.setMatrixAt( i, matrix );
		}
		mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
		scene.add( mesh );
	}
/////////////////////////////////////////////////////
	//scene.add( ambientLight );
	//scene.add( hemiLight );
	scene.add( dirLight );	
}


function createGUI( model, animations ) {
	
	//coin = model.getObjectByName( 'coin_octagono.broken' );
	coin = model.children[0];
	const expressions = Object.keys( model.children[0].morphTargetDictionary );
}

//lights 
const dirLight = new THREE.DirectionalLight( 0xe24090 );
dirLight.position.set( -60, 10, -60 );
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 128; // default
dirLight.shadow.mapSize.height = 128; // default
dirLight.shadow.camera.near = 0.5; // default
dirLight.shadow.camera.far = 500; 


//
const ambientLight = new THREE.AmbientLight( 0x13131e );
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 1);

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
	if(lock == true){
		//mainScene.rotation.y = (elapsedTime);
		if(mainScene.rotation.y > 0){
			mainScene.rotation.y = mainScene.rotation.y - 0.001;
		}
		if(mainScene.rotation.x > 0){
			mainScene.rotation.x = mainScene.rotation.x - 0.01;
		}
		if(mainScene.rotation.z > 0){
			mainScene.rotation.z = mainScene.rotation.z - 0.01;
		}
		const elapsedTime = clock.getElapsedTime();
		mainScene.rotation.y = (elapsedTime);
		const halfPi = (Math.PI / 2);
		/*
		if(mainScene.rotation.y >= halfPi){
			//changeTexture();
			halfPiBool = true
		}
		if(halfPiBool == true){
			changeTexture();
		}*/
		//if(elapsedTime =< 2)
		if(camera.position.z > 7){
			camera.position.z -= 0.005
		}else if(camera.position.z <= 7 && camera.position.z > 6.2){
			camera.position.z -= 0.0025
		}
		/* Mouse position interaction */
		//mainScene.rotation.y += 0.5 * (targetX - mainScene.rotation.y)
		mainScene.rotation.x += 0.1 * (targetY - mainScene.rotation.x)	
		//mainScene.rotation.z = (elapsedTime * 0.1)

		/*Meshes Rotation*/
		backgroundCoins.rotation.y = (elapsedTime * 0.1)
		backgroundCoins.rotation.z = (elapsedTime * 0.04)
		backgroundCoins.rotation.x = (elapsedTime * 0.075)
		bang.rotation.y = (elapsedTime * -0.1)
		bang.rotation.z = (elapsedTime * -0.04)
		bang.rotation.x = (elapsedTime * -0.075)
		document.getElementById("unlockelement").style.display = "none";
		document.querySelector(".social-media-icons").style.opacity = "100%";
		document.querySelector(".navigation-scroll").style.opacity = "100%";
		//document.querySelector(".slogan-container").style.opacity = "0%";
		document.querySelector(".slogan-container").style.animation = "slogancontaineranimation 1.5s ease 0s 1 normal";
	}else if(lock == false){
		const rspeed = 0.001;
		mainScene.rotation.y += rspeed;
		mainScene.rotation.x += rspeed;
		mainScene.rotation.z += rspeed;
	}
}


const pointer = new THREE.Vector2();
function animate() {	
	navigation();
	requestAnimationFrame(animate);
	playScrollAnimations()
	tick();
	//render();
	composer.render();
}
function onPointerMove( event ) {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function render(){
	renderer.render(scene, camera);
}
window.scrollTo({ top: 0, behavior: 'smooth' })

//Animation Scroll
function lerp(x, y, a) {
    return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts = []
const bgexplosion = document.getElementById("bg-explosion");

animationScripts.push({
    start: 0,
    end: 20,
    func: () => {
		//params.bloomStrength = lerp(0.1, 1.2, scalePercent(0,20));
		//bloomPass.strength = lerp(0.01, 1.2, scalePercent(0,20));
		camera.position.x = lerp(0,-1.5, scalePercent(0,20));
		camera.lookAt.x = lerp(0,-1.5, scalePercent(0,20));
		mainScene.children[0].morphTargetInfluences[0] = lerp(0,0.1, scalePercent(0, 20));
		backgroundCoins.scale.x = lerp(0,0.4, scalePercent(0,20));
		backgroundCoins.scale.y = lerp(0,0.4, scalePercent(0,20));
		backgroundCoins.scale.z = lerp(0,0.4, scalePercent(0,20));
		bang.scale.x = lerp(0,2, scalePercent(0,20));
		bang.scale.y = lerp(0,2, scalePercent(0,20));
		bang.scale.z = lerp(0,2, scalePercent(0,20));
    },
})
animationScripts.push({
    start: 20,
    end: 40,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(41, 60));
		//mainScene.position.z = lerp(1,1, scalePercent(41, 60));
		mainScene.children[0.].morphTargetInfluences[0] = lerp(0.1,0.3, scalePercent(20, 40));
		backgroundCoins.scale.x = lerp(0.4,0.4, scalePercent(20, 60));
		backgroundCoins.scale.y = lerp(0.4,0.4, scalePercent(20, 60));
		backgroundCoins.scale.z = lerp(0.4,0.4, scalePercent(20, 60));
		camera.position.x = lerp(-1.5,-1.5, scalePercent(20,60));
		camera.lookAt.x = lerp(-1.5,-1.5, scalePercent(20,60));
    },
})
animationScripts.push({
    start: 40,
    end: 60,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(41, 60));
		//mainScene.position.z = lerp(1,1, scalePercent(41, 60));
		mainScene.children[0.].morphTargetInfluences[0] = lerp(0.3,1, scalePercent(40, 60));
		backgroundCoins.scale.x = lerp(0.4,1, scalePercent(40, 60));
		backgroundCoins.scale.y = lerp(0.4,1, scalePercent(40, 60));
		backgroundCoins.scale.z = lerp(0.4,1, scalePercent(40, 60));
		camera.position.x = lerp(-1.5,-1.5, scalePercent(40,60));
		camera.lookAt.x = lerp(-1.5,-1.5, scalePercent(40,60));
    },
})
animationScripts.push({
    start: 60,
    end: 80,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(60, 80));
		//mainScene.position.z = lerp(1,1, scalePercent(60, 80));
		mainScene.children[0.].morphTargetInfluences[0] = lerp(1,0, scalePercent(61, 80));
		backgroundCoins.scale.x = lerp(1,0, scalePercent(60, 80));
		backgroundCoins.scale.y = lerp(1,0, scalePercent(60, 80));
		backgroundCoins.scale.z = lerp(1,0, scalePercent(60, 80));
		bang.scale.x = lerp(2,0, scalePercent(60, 80));
		bang.scale.y = lerp(2,0, scalePercent(60, 80));
		bang.scale.z = lerp(2,0, scalePercent(60, 80));
		camera.position.x = lerp(-1.5,-1.5, scalePercent(60,80));
		camera.lookAt.x = lerp(-1.5,-1.5, scalePercent(60,80));
    },
})
animationScripts.push({
    start: 81,
    end: 101,
    func: () => {
		//mainScene.position.x = lerp(3,3, scalePercent(80, 100));
		//mainScene.position.z = lerp(1,1, scalePercent(80, 100));
		mainScene.children[0.].morphTargetInfluences[0] = lerp(0,0, scalePercent(80, 100));
		backgroundCoins.scale.x = lerp(0,0, scalePercent(80, 100));
		backgroundCoins.scale.y = lerp(0,0, scalePercent(80, 100));
		backgroundCoins.scale.z = lerp(0,0, scalePercent(80, 100));
		bang.scale.x = lerp(0,0, scalePercent(80, 100));
		bang.scale.y = lerp(0,0, scalePercent(80, 100));
		bang.scale.z = lerp(0,0, scalePercent(80, 100));
		camera.position.z = lerp(5,10, scalePercent(80, 100));
		camera.position.x = lerp(-1.5,0, scalePercent(80,100));
		camera.lookAt.x = lerp(-1.5,0, scalePercent(80,100));		
		mainScene.rotation.y = lerp(1,0, scalePercent(80,100));		
    },
})
function playScrollAnimations() {
	const scrollbottom = document.body.scrollHeight - document.body.scrollTop;
	if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500 || document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
		document.querySelector(".bg-explosion").style.opacity = "100%";
	} else {
		document.querySelector(".bg-explosion").style.opacity = "0%";
	}
	//console.log(document.documentElement.scrollHeight)
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
	/*document.getElementById('scrollProgress').innerText =
        'Scroll Progress : ' + scrollPercent.toFixed(2);*/
}
function navigation(){
	//document.getElementById("unlockbutton").addEventListener('click', unlock);	
	document.getElementById("unlockelement").addEventListener('click', unlock);	
}
function unlock(){
	setTimeout(function(){
		console.log('He esperado media vuelta');
		arrtextureLoader.load(arr[1], function(tex) {
			coinMaterial.normalMap = tex;
		 }); 		
		setInterval(function() {			
			arrtextureLoader.load(arr[textureToShow], function(tex) {
				// Once the texture has loaded
				// Asign it to the material
				coinMaterial.normalMap = tex;
				// Update the next texture to show
				textureToShow++;
				// Have we got to the end of the textures array
				if(textureToShow > arr.length-1) {
				textureToShow = 0;
				}
			 }); 
		},((Math.PI)*2000))
	}, 2600);
	/*setInterval(function() {
		arrtextureLoader.load(arr[textureToShow], function(tex) {
			// Once the texture has loaded
			// Asign it to the material
			coinMaterial.normalMap = tex;
			// Update the next texture to show
			textureToShow++;
			// Have we got to the end of the textures array
			if(textureToShow > arr.length-1) {
			textureToShow = 0;
			}
		 }); 
	},((Math.PI)*2000))*/
	document.getElementById("stage").style.overflowY = 'scroll';
	lock = !lock
}
function changeTexture(){
	console.log('function change texture');
	/*setInterval(function() {
		console.log('He esperado media vuelta');
		arrtextureLoader.load(arr[textureToShow], function(tex) {
			// Once the texture has loaded
			// Asign it to the material
			coinMaterial.normalMap = tex;
			// Update the next texture to show
			textureToShow++;
			// Have we got to the end of the textures array
			if(textureToShow > arr.length-1) {
			textureToShow = 0;
			}
		 }); 
	},((Math.PI)*2000))*/
}