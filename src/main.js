import { ForceBar } from "./ForceBar.js";
import { InputManager } from "./InputManager.js";
import { SceneManager } from "./SceneManager.js";
import { WebGLManager } from "./WebGLManager.js";

const inputManager = new InputManager();
const sceneManager = new SceneManager();
const webgl = new WebGLManager();
const forceBar = new ForceBar();

window.onload = function init() {
    sceneManager.setupScene();
    
    inputManager.setBowlingBall(sceneManager.getBowlingBall());
    inputManager.start();
    
    webgl.init(45.0);
    webgl.start();
}
