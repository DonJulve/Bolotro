import { pointsSphere, pointsCube, pointsPlane } from "./Geometría.js";

export class BowlingBall {

    constructor(x, y, z) {
        // TODO POINTARRAY
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_color: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
        };
        this.primType = "triangles";

        // Propiedades fisicas
        this.velocity = vec3(0, 0, 0);
        this.position = vec3(x, y, z);

        this.velocityNextFrame = vec3(0,0,0);
        this.positionNextFrame = vec3(0,0,0);

        this.#updatePosition();
    }

    #updatePosition() {
        this.uniforms.u_model = translate(this.position[0], this.position[1], this.position[2]);
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
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
