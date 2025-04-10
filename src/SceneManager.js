import { BowlingBall, Plano, Pin } from "./Objects.js";
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
        var plano = new Plano();
        var bowlingBall = new BowlingBall();
        var pin = new Pin(2, 0, 0);

        // Configuracion de los objetos
        var sphereProgramInfo = webGLManager.getProgramInfoTemplate("SPHERE");
        var cubeProgramInfo = webGLManager.getProgramInfoTemplate("CUBE");
        var planoProgramInfo = webGLManager.getProgramInfoTemplate("PLANE");

        bowlingBall.setProgramInfo(sphereProgramInfo);
        pin.setProgramInfo(cubeProgramInfo);
        plano.setProgramInfo(planoProgramInfo);

        // Añadirlos a la escena
        console.log("Adding bowling ball");

        this.objects.push(pin);
        this.objects.push(bowlingBall);
        this.objects.push(plano);

        webGLManager.setPrimitives(this.objects);
    }

    update(dt) {
      // Actualizar la lógica del juego: bola, bolos, etc.
      console.log("Updating scene");

    }


    getObjectsToDraw() {
        return this.objects
    }
  }
