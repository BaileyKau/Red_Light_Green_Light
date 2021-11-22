const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xb7c3f3, 1 );

const light = new THREE.AmbientLight( 0xffffff );
scene.add( light );

//Global Variables
const start_pos = 3;
const end_pos = -start_pos;
const text = document.querySelector(".text")
const timeLimit = 15;
let gameStatus = "loading";
let isLookingForwards = true;

function createCube(size, posX, rotY = 0, color = 0xfbc851) {
    // Create a green cube in the middle of the screen using Three.js
    const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = posX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
    constructor() {
        loader.load("./models/scene.gltf", (gltf) => {
            scene.add( gltf.scene );
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1, 0);
            this.doll = gltf.scene;
        })
    }
    lookBackward() {
        // this.doll.rotation.y = -3.15;
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
        setTimeout(() => isLookingForwards = true, 350)
    }   
    lookForward() {
        // this.doll.rotation.y = 0;
        gsap.to(this.doll.rotation, {y: 0, duration: .45})
        setTimeout(() => isLookingForwards = false, 150)
    }
    async start() {
        this.lookBackward()
        await delay((Math.random() * 1000) + 1000)
        this.lookForward()
        await delay((Math.random() * 750) + 750)
        this.start()
    }
}

function createTrack() {
    createCube({w: start_pos * 2 + .2, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w: .2, h: 1.5, d: 1}, start_pos, -.35);
    createCube({w: .2, h: 1.5, d: 1}, end_pos, .35);
}
createTrack();

class Player {
    constructor(){
        loader.load("./models_player/scene.gltf", (gltf) => {
            scene.add( gltf.scene );
            gltf.scene.scale.set(.01, .01, .01);
            gltf.scene.position.set(3.5, -.75, 0);
            this.player = gltf.scene;
            this.player.rotation.y = -1.6;
            this.playerInfo = {
                positionX: 3.50,
                velocity: 0,
            }
        })
    }
    run() {
        this.playerInfo.velocity = .03;
    }
    stop() {
        // this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo, {velocity: 0, duration: 0.3})
    }
    check() {
        if(this.playerInfo.velocity > 0 && isLookingForwards) {
            text.innerHTML = "You lose!"
            gameStatus = "over"
        }
        if(this.playerInfo.positionX < end_pos) {
            text.innerHTML = "You win!"
            gameStatus = "over"
        }
    }
    update() {
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity; 
        const new_pos = this.playerInfo.positionX;
        this.player.position.x = new_pos;
    }
}

const player = new Player(); 
let doll = new Doll();

async function init() {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Start!"
    startGame()
}

function startGame() {
    gameStatus = "started"
    let progressBar = createCube({w: 5, h: .1, d: 1}, 0)
    progressBar.position.y = 3.45;
    gsap.to(progressBar.scale, {x: 0, duration: timeLimit*0.8})
    doll.start()
    setTimeout(() => {
        if(gameStatus != "over") {
            text.innerHTML = "You ran out of time!"
            gameStatus = "over"
        }
    }, timeLimit*1000);
}
window.addEventListener("load", () => {
    init()
}) 

document.addEventListener('keydown', (e) => {
    if(gameStatus != "started") {
        return
    }
    if(e.key == "ArrowUp") {
        player.run()
    }
})
document.addEventListener('keyup', (e) => {
    if(gameStatus != "started") {
        return
    }
    if(e.key == "ArrowUp") {
        player.stop()
    }
})

function animate() {
    if(gameStatus == "over") {
        return
    }
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    player.update();
}
animate();

document.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}