import { pointsSphere, pointsCube, pointsPlane } from "./Geometría.js";

export class BowlingBall {

    constructor(x, y, z) {
        // TODO POINTARRAY
        // Guardo posicion y velocidad inicial
        this.initialPosition = vec3(x, y, z);
        this.initialVelocity = vec3(0, 0, 0);
        this.initialOrientation = mat4(); // Orientación inicial
    
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_color: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
        };
        this.primType = "triangles";

        // Propiedades fisicas
        this.velocity = vec3(0, 0, 0);
        this.position = vec3(x, y, z);
        this.orientation = mat4();

        // Para control de límites
        this.currentRotationAngle = 0;
        this.currentHorizontalOffset = 0;

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

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
        this.orientation = mat4();
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


    calculateNextFrame() {
        // PRUEBAS
        const g = vec3(0, 0.01, 0);
        this.positionNextFrame = subtract(this.position, g);
        this.#updatePosition();
        console.log(this.position);
    }

    applyNextFrame() {
        this.velocity = this.velocityNextFrame;
        this.position = this.positionNextFrame;
        this.#updatePosition();
    }
  }
  
export class Pin {
    constructor(x, y, z) {
        this.pointsArray = pointsCube;
        this.uniforms = {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		};
		this.primType = "triangles";

        // Propiedades fisicas
        this.velocity = vec3(0, 0, 0);
        this.position = vec3(x, y, z);

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        this.#updatePosition();
        this.#rotate();    
    }

    #updatePosition() {
        const translationMatrix = translate(this.position[0], this.position[1], this.position[2]); // solo mueve en Y
        this.uniforms.u_model = mult(translationMatrix, this.uniforms.u_model);
    }

    #rotate() {
        const rotationMatrix = rotate(90, vec3(1, 0, 0)); 
        this.uniforms.u_model = mult(rotationMatrix, this.uniforms.u_model);
    }
  
    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame() {
      // TODO
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
        this.#rotate();
        this.#moveDown();

    }
    

    #rotate() {
        const rotationMatrix = rotate(90, vec3(1, 0, 0)); 
        this.uniforms.u_model = mult(rotationMatrix, this.uniforms.u_model);
    }

    #moveDown() {
        const translationMatrix = translate(0.0, -1.0, 0.0); // solo mueve en Y
        this.uniforms.u_model = mult(translationMatrix, this.uniforms.u_model);
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    calculateNextFrame() {
      // TODO
    }

    applyNextFrame() {

    }
}
