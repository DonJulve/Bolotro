import { Camera } from "./Camera.js";
import { ForceBar } from "./ForceBar.js";

export class InputManager {
    constructor() {
        // Conjunto para ver que teclas están presionadas
        this.keysPressed = new Set(); 
        this.camera = new Camera();
        this.bowlingBall = null;
        this.forceBar = null;
        // TODO
    }
    // ----------------------------
    // Funciones Privadas
    // ----------------------------
    #leftKeyHandler(estado) {
        if (!this.bowlingBall.hasShot) {
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
    }

    #rightKeyHandler(estado) {
        if (!this.bowlingBall.hasShot) {
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
            this.camera.reset();
            this.bowlingBall.reset();
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #spaceKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            this.forceBar.loadShot(this.bowlingBall);
        }
        else if (estado == "SOLTADA") {
            let shotForce = this.forceBar.shoot();
            this.bowlingBall.shoot(shotForce);
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
        window.addEventListener("keydown", this.#onKeyDown.bind(this));
        window.addEventListener("keyup", this.#onKeyUp.bind(this));
    }

    stop() {
        window.removeEventListener("keydown", this.#onKeyDown);
        window.removeEventListener("keyup", this.#onKeyUp);
    }

    // Para obtener la instancia de la bola
    setBowlingBall(bowlingBall){
        this.bowlingBall = bowlingBall;
        this.forceBar = new ForceBar(bowlingBall);
    }
}
