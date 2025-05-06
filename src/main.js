import { ForceBar } from "./ForceBar.js";
import { InputManager } from "./InputManager.js";
import { SceneManager } from "./SceneManager.js";
import { WebGLManager } from "./WebGLManager.js";
import { MassManager } from "./MassManager.js";

const inputManager = new InputManager();
const sceneManager = new SceneManager();
const webgl = new WebGLManager();
const forceBar = new ForceBar();

window.onload = function init() {
    sceneManager.setupScene();
    
    const bowlingBall = sceneManager.getBowlingBall();
    const plano = sceneManager.getPlano();
    inputManager.setBowlingBall(bowlingBall);
    inputManager.start();

    sceneManager.inputManager = inputManager;
    
    new MassManager(bowlingBall);
    
    webgl.init(45.0);
    bowlingBall.loadTexture(webgl.gl, "../assets/watermelon.png");
    plano.loadTexture(webgl.gl, "../assets/wood.jpg");

    // El verdadero fondo del plano increible
    // plano.loadTexture(webgl.gl, "../assets/capibara.jpg");
    webgl.start();
}
