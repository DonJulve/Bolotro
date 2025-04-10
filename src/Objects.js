import { pointsSphere, pointsCube, pointsPlane } from "./Geometría.js";

export class BowlingBall {

    constructor() {
        // TODO POINTARRAY
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_color: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
        };
        this.primType = "triangles";
        this.primitive;

        // TODO ESTO QUITAR IRÁ DENTRO DEL MOTOR DE FISICAS
        this.position = [0.0, 0.0, 0.0];
    }

    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    update() {

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
        this.#move(x, y, z);
        this.#rotate();    
    }

    #move(x, y, z) {
        const translationMatrix = translate(x, y, z); // solo mueve en Y
        this.uniforms.u_model = mult(translationMatrix, this.uniforms.u_model);
    }

    #rotate() {
        const rotationMatrix = rotate(90, vec3(1, 0, 0)); 
        this.uniforms.u_model = mult(rotationMatrix, this.uniforms.u_model);
    }
  
    setProgramInfo(pInfo) {
        this.programInfo = pInfo;
    }

    update() {
      // TODO
    }
}

export class Plano {
    constructor() {
        this.pointsArray = pointsPlane;
        this.uniforms = {
			u_color: [0.0, 1.0, 1.0, 1.0],
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

    update() {
      // TODO
    }
}
