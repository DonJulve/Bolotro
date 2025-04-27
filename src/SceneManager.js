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
    createPins() {

        var webGLManager = new WebGLManager(); 
        const spacing = 3; // Separación entre pines (ajústalo como quieras)
        let startX = 0; 
        let startZ = 0; // Primer bolo en (0, 0)
        let count = 0; 
        var cubeProgramInfo = webGLManager.getProgramInfoTemplate("CUBE");

        for (let row = 1; row <= 4; row++) { // 4 filas
            const offsetX = -(row - 1) * (spacing / 2); // Centrar cada fila respecto al anterior
            for (let i = 0; i < row; i++) {
                const x = startX + offsetX + i * spacing;
                const y = 1.5; // Altura inicial (puedes ajustar)
                const z = startZ + (row - 1) * spacing; // Cada fila un poco más lejos
                
                const pin = new Pin(z, y, x);
                pin.setProgramInfo(cubeProgramInfo);
                this.objects.push(pin);
                count++;
                if (count >= 10) break; // Solo crear 10 bolos
            }
            if (count >= 10) break;
        }
    }

    setupScene() {
        // Es un singleton da igual si lo creo de nuevo, me devuelve la unica instancia
        var webGLManager = new WebGLManager(); 

        // Instanciacion de los objetos
        var plano = new Plano();
        var bowlingBall = new BowlingBall(-5, 1, -1.2);

        this.createPins();

        // Configuracion de los objetos
        var sphereProgramInfo = webGLManager.getProgramInfoTemplate("SPHERE");

        var planoProgramInfo = webGLManager.getProgramInfoTemplate("PLANE");

        bowlingBall.setProgramInfo(sphereProgramInfo);
        plano.setProgramInfo(planoProgramInfo);

        // Añadirlos a la escena
        console.log("Adding bowling ball");

        this.objects.push(plano);
        this.objects.push(bowlingBall);

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

