import { BowlingBall } from "./Objects.js";
import { WebGLManager } from "./WebGLManager.js";

export class SceneManager {
    // ----------------------------
    // Funciones Privadas
    // ----------------------------

    // ----------------------------
    // Funciones Publicas
    // ----------------------------
    
    // Singleton
    static instance;
    constructor() {
        if (SceneManager.instance) {
            return SceneManager.instance;    
        }

        this.objects = [];

        SceneManager.instance = this;
    }

    setupScene() {
        // Es un singleton da igual si lo creo de nuevo, me devuelve la unica instancia
        var webGLManager = new WebGLManager(); 

        // Instanciacion de los objetos
        var bowlingBall = new BowlingBall();
        
        // Configuracion de los objetos
        var sphereProgramInfo = webGLManager.getProgramInfoTemplate("SPHERE");
        bowlingBall.setProgramInfo(sphereProgramInfo);

        // Añadirlos a la escena
        console.log("Adding bowling ball");
        this.objects.push(bowlingBall);
    }

    update(dt) {
      // Actualizar la lógica del juego: bola, bolos, etc.
      console.log("Updating scene");

    }


    getObjectsToDraw() {
        return this.objects
    }
  }
