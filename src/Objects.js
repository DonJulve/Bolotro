import { pointsSphere } from "./Geometría.js";

export class BowlingBall {

    constructor() {
        // TODO POINTARRAY
        this.pointsArray = pointsSphere;
        this.uniforms = {
          u_colorMult: [1.0, 1.0, 1.0, 1.0],  // Color de la bola
          u_model: new mat4(),      // Matriz de modelo (posición y transformación)
        };
        this.primType = "triangles";

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
    constructor(programInfo) {
        this.programInfo = programInfo;
        this.pointsArray = pointsCube;
        this.uniforms = {
			u_color: [1.0, 0.0, 0.0, 1.0],
			u_model: new mat4(),
		};
		this.primType = "triangles";      
    }
  
    update() {
      // TODO
    }
}
