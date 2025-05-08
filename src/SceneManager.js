import { BowlingBall, Plano, Pin } from "./Objects.js";
import { WebGLManager } from "./WebGLManager.js";
import { ScoreManager } from "./ScoreManager.js";

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
        this.bowlingBall = null;
        this.scoreManager = new ScoreManager();
        this.firstThrowPins = 0;
        this.secondThrowPins = 0;
        this.isFirstThrow = true;
        this.outPins = 0;
        this.hasPlayedCollisionSound = false;

        SceneManager.instance = this;
    }
    createPins() {
        var webGLManager = new WebGLManager();
        const gl = webGLManager.gl;
        
        //Borra todos los pines antes de añadir los nuevos
        this.objects = this.objects.filter(object => {
            if (object.constructor.name == "Pin") {
                return false;
            }
            else {
                return true;
            }
        });

        const spacing = 1.5; // Separación entre pines (ajústalo como quieras)
        let startX = 0; 
        let startZ = 5; // Primer bolo en (0, 0)
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
                pin.loadModel(gl, "../assets/Pin.obj");
                pin.loadTexture(gl, "../assets/Rainbow.jpg");
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
        var bowlingBall = new BowlingBall(-30, 1, 0);
        this.plano = plano;
        // Para que el inputmanager pueda usarla
        this.bowlingBall = bowlingBall;

        this.createPins();

        // Configuracion de los objetos
        var sphereProgramInfo = webGLManager.getProgramInfoTemplate("SPHERE");

        var planoProgramInfo = webGLManager.getProgramInfoTemplate("PLANE");

        bowlingBall.setProgramInfo(sphereProgramInfo);
        plano.setProgramInfo(planoProgramInfo);

        // Añadirlos a la escena
        this.objects.push(plano);
        this.objects.push(bowlingBall);

        webGLManager.setPrimitives(this.objects);
    }

    removeFalledPins() {
        this.objects = this.objects.filter(object => {
            if (object.constructor.name == "Pin") {
                object.hasHitBall = false;
                object.hasHitPin = false;
                return !object.hasFallen
            }
            else {
                return true;
            }
        });
    }

    registerThrow() {
        let fallenPins = this.countFallenPins();
        let shouldResetPins = false;
        fallenPins += this.outPins;
        
        if (this.isFirstThrow) {
            this.firstThrowPins = fallenPins;
            this.scoreManager.addThrow(this.firstThrowPins);
            this.isFirstThrow = false;
            
            // Si fue strike, pasa al siguiente turno y resetea pines
            if (this.firstThrowPins === 10) {
                shouldResetPins = true;
                this.isFirstThrow = true;
                this.firstThrowPins = 0;
                this.secondThrowPins = 0;
            }
        } else {
            this.secondThrowPins = fallenPins;
            this.scoreManager.addThrow(this.secondThrowPins);
            shouldResetPins = true; // Siempre resetear después del segundo tiro
            this.isFirstThrow = true;
            this.firstThrowPins = 0;
            this.secondThrowPins = 0;
        }
        
        this.updateScoreTable();
        this.outPins = 0;

        if (this.scoreManager.isGameOver()) {
            this.showGameOver();
        }
        
        if (shouldResetPins) {
            this.resetPins();
        }
    }


    updateScoreTable() {
        const throwsRow = document.getElementById('throws-row');
        const totalRow = document.getElementById('total-row');
    
        throwsRow.innerHTML = '';
        totalRow.innerHTML = '';
    
        const scoreTable = this.scoreManager.getScoreTable();
    
        scoreTable.forEach((round, index) => {
            throwsRow.innerHTML += `
                <td>${round.first}</td>
                <td>${round.second}</td>
                <td></td>
            `;
            totalRow.innerHTML += `<td colspan="3">${round.total}</td>`;
        });
    }

    resetPins() {
        const webGLManager = new WebGLManager();
        const cubeProgramInfo = webGLManager.getProgramInfoTemplate("CUBE");
    
        // Eliminar todos los pines existentes
        this.objects = this.objects.filter(object => {
            if (object.constructor.name === "Pin") {
                // Limpiar buffers gráficos del pin
                if (object.cleanup) object.cleanup(); 
                return false;
            }
            return true;
        });
    
        this.createPins();
    
        // Asegurar que los nuevos pines tienen su programInfo configurado
        this.objects.forEach(object => {
            if (object.constructor.name === "Pin") {
                object.setProgramInfo(cubeProgramInfo);
            }
        });
    
        // Resetear la bola
        if (this.bowlingBall) {
            this.bowlingBall.reset();
        }
    
        webGLManager.setPrimitives(this.objects);
    }

    showGameOver() {
        // Crear el elemento de Game Over si no existe
        let gameOverElement = document.getElementById('game-over-message');
        
        if (!gameOverElement) {
            gameOverElement = document.createElement('div');
            gameOverElement.id = 'game-over-message';
            gameOverElement.style.position = 'absolute';
            gameOverElement.style.top = '50%';
            gameOverElement.style.left = '50%';
            gameOverElement.style.transform = 'translate(-50%, -50%)';
            gameOverElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            gameOverElement.style.color = 'white';
            gameOverElement.style.padding = '20px';
            gameOverElement.style.borderRadius = '10px';
            gameOverElement.style.textAlign = 'center';
            gameOverElement.style.zIndex = '1000';
            gameOverElement.style.fontFamily = 'Arial, sans-serif';
            
            const finalScore = this.scoreManager.getFinalScore();
            gameOverElement.innerHTML = `
                <h1 style="margin-top: 0;">GAME OVER</h1>
                <p style="font-size: 1.2em;">Tu puntuación final fue: ${finalScore}</p>
                <button id="restart-button" style="
                    background-color: #4CAF50;
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 10px 2px;
                    cursor: pointer;
                    border-radius: 5px;
                ">Jugar de nuevo</button>
            `;
            
            document.body.appendChild(gameOverElement);
            
            // Agregar evento al botón de reinicio
            document.getElementById('restart-button').addEventListener('click', () => {
                this.resetGame();
                document.body.removeChild(gameOverElement);
                this.inputManager.start();
            });
        }
        this.inputManager.stop();
    }

    resetGame() {
        // Reiniciar el administrador de puntuación
        this.scoreManager.reset();
        
        // Reiniciar el estado del juego
        this.isFirstThrow = true;
        this.firstThrowPins = 0;
        this.secondThrowPins = 0;
        
        // Actualizar la tabla de puntuación
        this.updateScoreTable();
        
        // Reiniciar los pines y la bola
        this.resetPins();
    }

    update(dt) {
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

    getNumberOfPins() {
        let sum = 0;
        for (let object of this.objects) {
            if (object.constructor.name == "Pin" ) {
                sum++;
            }
        }
        return sum;
    }

    countFallenPins() {
      let fallenPins = 0;
      for (let object of this.objects) {
          if (object.constructor.name === "Pin" && object.hasFallen) {
              fallenPins++;
          }
      }
      return fallenPins;
    }

    getObjectsToDraw() {
        return this.objects
    }

    // Pasar la instancia de la bola
    getBowlingBall(){
        return this.bowlingBall;
    }
    
    getPlano(){
        return this.plano;
    }

  }

