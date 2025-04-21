import { pointsSphere, pointsCube, pointsPlane } from "./Geometría.js";
import { checkCollision, resolveCollision } from "./PhysicsEngine.js";
import { SceneManager } from "./SceneManager.js";

export class BowlingBall {

    constructor(x, y, z) {
        this.scene = new SceneManager();

        // Para control de la camara
        this.orientation = mat4();
        this.currentRotationAngle = 0;
        this.currentHorizontalOffset = 0;

        // Guardo posicion y velocidad inicial oara el reset
        this.initialPosition = vec3(x, y, z);
        this.initialVelocity = vec3(0, 0.0, 0);
        this.initialOrientation = mat4();
    
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_color: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
        };
        this.primType = "triangles";

        // Propiedades fisicas
        this.mass = 1;
        this.velocity = vec3(5, 0, 0);
        this.position = vec3(x, y, z);

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        // Propiedades exclusivas de la bola
        this.radius = 0.5

        this.#updatePosition();
    }

    #updatePosition() {
        let transform = mult(translate(this.position[0], this.position[1], this.position[2]), this.orientation);
        this.uniforms.u_model = transform;
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    reset() {
        this.position = vec3(
            this.initialPosition[0],
            this.initialPosition[1],
            this.initialPosition[2]
        );
        this.velocity = vec3(
            this.initialVelocity[0],
            this.initialVelocity[1],
            this.initialVelocity[2]
        );
        this.orientation = this.initialOrientation;
        this.currentRotationAngle = 0;
        this.currentHorizontalOffset = 0;
        this.#updatePosition();
    }

    // Mueve la bola junto con la cámara
    moveWithCamera(camera, direction, moveStep, limit) {
        // Verificar límites de movimiento
        if (this.currentHorizontalOffset > limit && direction) return;
        if (this.currentHorizontalOffset < -limit && !direction) return;

        const newEye = direction ? 
            vec3(camera.eye[0], camera.eye[1], camera.eye[2] + moveStep) : 
            vec3(camera.eye[0], camera.eye[1], camera.eye[2] - moveStep);
        
        this.currentHorizontalOffset += direction ? moveStep : -moveStep;
        
        // Calculamos la nueva posición relativa de la bola
        const relativePos = subtract(camera.eye, this.position);
        this.position = subtract(newEye, relativePos);
        
        this.#updatePosition();
    }

    // Rota la bola junto con la cámara
    rotateWithCamera(camera, direction, rotateStep, limit) {
        // Verificar límites de rotación
        const newRotationAngle = direction ? 
            this.currentRotationAngle + rotateStep : 
            this.currentRotationAngle - rotateStep;
            
        if (Math.abs(newRotationAngle) > limit) {
            return;
        }
        this.currentRotationAngle = newRotationAngle;

        const positionRotationMatrix = direction ? 
            rotate(rotateStep, camera.up) : 
            rotate(-rotateStep, camera.up);
    
        const selfRotationMatrix = direction ? 
            rotate(-rotateStep, camera.up) : 
            rotate(rotateStep, camera.up);
    
        // Aplicamos la rotación a la orientación de la bola
        this.orientation = mult(selfRotationMatrix, this.orientation);
    
        // Rotamos la posición de la bola alrededor del punto de vista de la cámara
        const relativePos = subtract(this.position, camera.eye);
        const rotatedPos = mult(positionRotationMatrix, vec4(relativePos[0], relativePos[1], relativePos[2], 1.0));
        this.position = add(camera.eye, vec3(rotatedPos[0], rotatedPos[1], rotatedPos[2]));
    
        this.#updatePosition();
    }


    calculateNextFrame(dt) {
        const sceneObjects = this.scene.getObjectsToDraw();

        // Si no hay cambios las siguientes velocidades serán las de ahora
        const friction = 0.95;
        const frictionVector = vec3(Math.pow(friction, dt),Math.pow(friction, dt), Math.pow(friction, dt))
        this.velocityNextFrame =  mult(this.velocity, frictionVector);
        this.positionNextFrame = add(this.position, mult(dt, this.velocity));

        
        // - - - DETECCION DE COLISIONES - - - - 
        let collisions = [];
        for(let object of sceneObjects) {
            // No queremos comparar las colisiones con nosotros mismos
            if (object != this) {
                if (checkCollision(this, object)) {
                    console.log("COLISION!");
                    
                    // Añadimos al vector de objetos que tratar el objeto con el que hemos colisionado.
                    collisions.push(object);
                }
            }
        }

        // - - - - TRATAMIENTO DE COLISIONES - - - -
        for(let object of collisions) {
            const type = object.constructor.name;
            if (type == "Pin") {
                resolveCollision(dt, this, object);
            }
            else if (type == "Plano") {
                // Para que no detecte colisiones infinitas y se quede atascado cuando detectamos
                // la colision separamos un poco la bola del suelo
                const planeSeparation = vec3(0, 0.05, 0);
                this.velocityNextFrame = vec3(this.velocity[0], this.velocity[1]*-0.5, this.velocity[2]);
                this.positionNextFrame = add(add(this.position, planeSeparation), mult(dt, this.velocityNextFrame));
            }
            else {

            }
        }
    }

    applyNextFrame() {
        this.velocity = this.velocityNextFrame;
        this.position = this.positionNextFrame;
        this.#updatePosition();
    }
  }
  
export class Pin {
    constructor(x, y, z) {
        this.scene = new SceneManager();
        this.pointsArray = pointsCube;
        this.uniforms = {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		};
		this.primType = "triangles";

        // Propiedades fisicas
        this.mass = 0.5;
        this.velocity = vec3(0, 0, 0);
        this.position = vec3(x, y, z);

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        // Propiedades exclusivas del pin
        this.pinNumber = Pin.numPines++;
        this.width = 1;
        this.depth = 1
        this.height = 3;

        
        this.#updatePosition();    
    }

    #updatePosition() {
        //const translationMatrix =  // solo mueve en Y
        this.uniforms.u_model = translate(this.position[0], this.position[1], this.position[2]);
    }

  
    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame(dt) {
        const sceneObjects = this.scene.getObjectsToDraw();

        // Si no hay cambios las siguientes velocidades serán las de ahora
        const friction = 0.7;
        const frictionVector = vec3(Math.pow(friction, dt),Math.pow(friction, dt), Math.pow(friction, dt))
        this.velocityNextFrame =  mult(this.velocity, frictionVector);
        this.positionNextFrame = add(this.position, mult(dt, this.velocity));

        
        // - - - DETECCION DE COLISIONES - - - - 
        let collisions = [];
        for(let object of sceneObjects) {
            // No queremos comparar las colisiones con nosotros mismos
            if (object != this) {
                if (checkCollision(this, object)) {
                    debugger;
                    // Añadimos al vector de objetos que tratar el objeto con el que hemos colisionado.
                    collisions.push(object);
                }
            }
        }

        // - - - - TRATAMIENTO DE COLISIONES - - - -
        for(let object of collisions) {
            const type = object.constructor.name;
            if (type == "Pin") {
                resolveCollision(dt, this, object);
            }
            else if (type == "BowlingBall") {
                resolveCollision(dt, this, object);
            }
            else {

            }
        }
    }

    applyNextFrame() {
        this.velocity = this.velocityNextFrame;
        this.position = this.positionNextFrame;
        this.#updatePosition();
    }
}

export class Plano {
    constructor() {
        this.pointsArray = pointsPlane;
        this.uniforms = {
			u_color: [0.0, 1.0, 0.0, 0.5],
			u_model: new mat4(),
		};
		this.primType = "triangles";   
        
        this.normal = vec3(0, 1, 0);
        this.position = vec3(0, 0, 0);

        // Caracteristicas del plano
        this.width = 10;
        this.depth = 10
        this.height = 0;


        this.#rotate();
    }
    

    #rotate() {
        const rotationMatrix = rotate(90, vec3(1, 0, 0)); 
        this.uniforms.u_model = mult(rotationMatrix, this.uniforms.u_model);
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame() {
        // El plano no se mueve 
        return;
    }

    applyNextFrame() {
        // El plano no se mueve
        return; 
    }
}
