import { InputManager } from "./InputManager.js";
import { SceneManager } from "./SceneManager.js";
import { WebGLManager } from "./WebGLManager.js";

const inputManager = new InputManager();
const sceneManager = new SceneManager();
const webgl = new WebGLManager();

window.onload = function init() {
    inputManager.start();
    sceneManager.setupScene();
    
    webgl.init(45.0);
    webgl.start();
}
