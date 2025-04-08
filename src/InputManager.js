// Equivalente a un enum en C++
const KeyState = {
    PRESIONADA: "PRESIONADA",
    SOLTADA: "SOLTADA",
}
Object.freeze(KeyState);

export class InputManager {
    constructor() {
        // Conjunto para ver que teclas están presionadas
        this.keysPressed = new Set(); 

        // TODO
    }
    // ----------------------------
    // Funciones Privadas
    // ----------------------------
    #upKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #downKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #leftKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #rightKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
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
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #spaceKeyHandler(estado) {
        if (estado == "PRESIONADA") {
            // TODO
        }
        else if (estado == "SOLTADA") {
            // TODO
        }
    }

    #onKeyDown(event) {
        switch(event.key) {
            case "ArrowUp":
                this.#upKeyHandler(PRESIONADA);
                break;
            case "ArrowDown":
                this.#downKeyHandler(PRESIONADA);
                break;
            case "ArrowRight":
                this.#rightKeyHandler(PRESIONADA);
                break;
            case "ArrowLeft":
                this.#leftKeyHandler(PRESIONADA);
                break;

            case "R":
            case "r":
                this.#R_KeyHandler(PRESIONADA);
                break;
            
            case " ":
                this.#spaceKeyHandler(PRESIONADA); 
                break;

            case "Shift":
                this.#shiftKeyHandler(PRESIONADA);
                break;
        }
        this.keysPressed.add(event.key);
    }

    #onKeyUp(event) {
        switch(event.key) {
            case "ArrowUp":
                this.#upKeyHandler(SOLTADA);
                break;
            case "ArrowDown":
                this.#downKeyHandler(SOLTADA);
                break;
            case "ArrowRight":
                this.#rightKeyHandler(SOLTADA);
                break;
            case "ArrowLeft":
                this.#leftKeyHandler(SOLTADA);
                break;

            case "R":
            case "r":
                this.#R_KeyHandler(SOLTADA);
                break;
            
            case " ":
                this.#spaceKeyHandler(SOLTADA); 
                break;

            case "Shift":
                this.#shiftKeyHandler(SOLTADA);
                break;
        }
        
        // Borrar del conjunto de teclas presionadas la que se acaba de soltar
        this.keysPressed.delete(event.key);
    }
    // ----------------------------
    // Funciones Publicas
    // ----------------------------
    start() {
        window.addEventListener("keydown", this.#onKeyDown);
        window.addEventListener("keyup", this.#onKeyUp);
    }

    stop() {
        window.removeEventListener("keydown", this.#onKeyDown);
        window.removeEventListener("keyup", this.#onKeyUp);
    }
}