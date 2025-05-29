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
        this.shotInProgress = false;
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

    #upKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            //Chekeo para no quedarnos bloqueados en la vista halcon
            if (this.camera.eye[2] !== 10) {
                this.lastEyeCamera = this.camera.eye
                this.camera.eye = vec3(-20.0, 15.0, 10.0);
            }
        }
        else if (estado == "SOLTADA") {
            this.camera.eye = this.lastEyeCamera
        }
    }


    #R_KeyHandler(estado) {
        if (estado == "PRESIONADA") {
            this.sceneManager.registerThrow();
            this.camera.reset();
            this.bowlingBall.reset();
            this.sceneManager.removeFalledPins();
            this.forceBar.reset();
            this.shotInProgress = false;
            window.controlRollingSound(false, 0);
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
            this.shotInProgress = false;
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

            this.shotInProgress = true;
        }
    }

    #onKeyDown(event) {
        if (this.shotInProgress && !["R", "r", "ArrowUp"].includes(event.key)) return;
        const upKeyPressed = this.keysPressed.has("ArrowUp");
        switch(event.key) {
            case "ArrowRight":
                if (!upKeyPressed) {
                    this.#rightKeyHandler("PRESIONADA");
                }
                break;
            case "ArrowLeft":
                if (!upKeyPressed) {
                    this.#leftKeyHandler("PRESIONADA");
                }
                break;
            case "ArrowUp":
                this.#upKeyHandler("PRESIONADA");
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
        if (this.shotInProgress && !["R", "r", "ArrowUp"].includes(event.key)) return;
        const upKeyPressed = this.keysPressed.has("ArrowUp");
        switch(event.key) {
            case "ArrowRight":
                if (!upKeyPressed) {
                    this.#rightKeyHandler("SOLTADA");
                }
                break;
            case "ArrowLeft":
                if (!upKeyPressed) {
                    this.#leftKeyHandler("SOLTADA");
                }
                break;

            case "ArrowUp":
                this.#upKeyHandler("SOLTADA");
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
