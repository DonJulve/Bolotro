import { Camera } from "./Camera.js";
import { ForceBar } from "./ForceBar.js";
import { BowlingBall } from "./Objects.js";
import { SceneManager } from "./SceneManager.js";

export class InputManager {
    constructor() {
        // Conjunto para ver que teclas están presionadas
        this.keysPressed = new Set(); 
        this.camera = new Camera();

        this.sceneManager = new SceneManager();
        this.bowlingBall = null;
        this.forceBar = new ForceBar();
        this._spaceInterval = null;
        // TODO
    }
    // ----------------------------
    // Funciones Privadas
    // ----------------------------
    #leftKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            if (this.keysPressed.has("Shift")){
                this.camera.rotateCamera(false);
                this.bowlingBall.rotateWithCamera(this.camera, false, this.camera.constructor.ROTATE_STEP, this.camera.constructor.MAX_ROTATION);
            }
            else {
                this.camera.moveCamera(false);
                this.bowlingBall.moveWithCamera(this.camera, false, this.camera.constructor.MOVE_STEP, this.camera.constructor.MAX_HORIZONTAL);
            }
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #rightKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            if (this.keysPressed.has("Shift")){
                this.camera.rotateCamera(true);
                this.bowlingBall.rotateWithCamera(this.camera, true, this.camera.constructor.ROTATE_STEP, this.camera.constructor.MAX_ROTATION);
            }
            else {
                this.camera.moveCamera(true);
                this.bowlingBall.moveWithCamera(this.camera, true, this.camera.constructor.MOVE_STEP, this.camera.constructor.MAX_HORIZONTAL);
            }
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #shiftKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #R_KeyHandler(estado) {
        if (estado == "PRESIONADA") {
            this.sceneManager.registerThrow();
            this.camera.reset();
            this.bowlingBall.reset();
            this.sceneManager.removeFalledPins();
            this.forceBar.reset();
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #spaceKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            if (this._spaceInterval) return;
            this.forceBar.loadShot();
            this._spaceInterval = setInterval(() => {
              this.forceBar.loadShot();
            }, 50);
            
        }
        else if (estado == "SOLTADA") {
            if (this._spaceInterval) {
              clearInterval(this._spaceInterval);
              this._spaceInterval = null;
            }

            const potencia = this.forceBar.shoot();

            const anguloTiroRadianes = (90 - this.camera.rotationAngle ) * (Math.PI / 180);
            const x = potencia * Math.sin(anguloTiroRadianes);
            const z = potencia * Math.cos(anguloTiroRadianes);
            this.bowlingBall.velocity = vec3(x, 0, z);
            this.bowlingBall.start = true;

            this.camera.eye = vec3(-30.0, 10.0, 10.0)
        }
    }

    #onKeyDown(event) {
        switch(event.key) {
            case "ArrowRight":
                this.#rightKeyHandler("PRESIONADA");
                break;
            case "ArrowLeft":
                this.#leftKeyHandler("PRESIONADA");
                break;

            case "R":
            case "r":
                this.#R_KeyHandler("PRESIONADA");
                break;
            
            case " ":
                this.#spaceKeyHandler("PRESIONADA"); 
                break;

            case "Shift":
                this.#shiftKeyHandler("PRESIONADA");
                break;
        }
        this.keysPressed.add(event.key);
    }

    #onKeyUp(event) {
        switch(event.key) {
            case "ArrowRight":
                this.#rightKeyHandler("SOLTADA");
                break;
            case "ArrowLeft":
                this.#leftKeyHandler("SOLTADA");
                break;

            case "R":
            case "r":
                this.#R_KeyHandler("SOLTADA");
                break;
            
            case " ":
                this.#spaceKeyHandler("SOLTADA"); 
                break;

            case "Shift":
                this.#shiftKeyHandler("SOLTADA");
                break;
        }
        
        // Borrar del conjunto de teclas presionadas la que se acaba de soltar
        this.keysPressed.delete(event.key);
    }
    // ----------------------------
    // Funciones Publicas
    // ----------------------------
    start() {
        this.bowlingBall = this.sceneManager.bowlingBall;

        // Guardar las funciones enlazadas
        this._boundOnKeyDown = this.#onKeyDown.bind(this);
        this._boundOnKeyUp = this.#onKeyUp.bind(this);

        window.addEventListener("keydown", this._boundOnKeyDown);
        window.addEventListener("keyup", this._boundOnKeyUp);
    }

    stop() {
        window.removeEventListener("keydown", this._boundOnKeyDown);
        window.removeEventListener("keyup", this._boundOnKeyUp);
    }

    // Para obtener la instancia de la bola
    setBowlingBall(bowlingBall){
        this.bowlingBall = bowlingBall;
    }
}
