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
        var bowlingBall = new BowlingBall(-5, 1, 0);
        var pin = new Pin(2, 1.5, 1.5);
        var pin2 = new Pin(0, 1.5, 0);


        // Configuracion de los objetos
        var sphereProgramInfo = webGLManager.getProgramInfoTemplate("SPHERE");
        var cubeProgramInfo = webGLManager.getProgramInfoTemplate("CUBE");
        var planoProgramInfo = webGLManager.getProgramInfoTemplate("PLANE");

        bowlingBall.setProgramInfo(sphereProgramInfo);
        pin.setProgramInfo(cubeProgramInfo);
        pin2.setProgramInfo(cubeProgramInfo);
        plano.setProgramInfo(planoProgramInfo);

        // Añadirlos a la escena
        console.log("Adding bowling ball");

        this.objects.push(pin);
        this.objects.push(pin2);
        this.objects.push(bowlingBall);
        this.objects.push(plano);

        webGLManager.setPrimitives(this.objects);
    }

    update(dt) {
        console.log("Updating scene");

        // Calculamos el siguiente frame para todos los objetos
        for (let object of this.objects) {
            object.calculateNextFrame(dt);
        }

        // Una vez todos los objetos tengan sus nuevos frames calculados
        // actualizamos los objetos
        for (let object of this.objects) {
            object.applyNextFrame();
        }
        
    }


    getObjectsToDraw() {
        return this.objects
    }

    // Pasar la instancia de la bola
    getBowlingBall(){
        return this.bowlingBall;
    }
  }
